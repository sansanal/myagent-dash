import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, Play, Pause, Settings, Trash2, 
  TrendingUp, Calendar, Clock, AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";

interface AIAgent {
  id: string;
  name: string;
  description: string;
  workflow_id: string;
  status: "active" | "inactive" | "paused";
  configuration: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AgentExecution {
  id: string;
  agent_id: string;
  status: "running" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  execution_time_ms?: number;
  error_message?: string;
}

export const AgentesIA = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState("Cuenta Principal");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAgents();
      fetchExecutions();
    }
  }, [user]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents((data || []) as AIAgent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los agentes",
        variant: "destructive",
      });
    }
  };

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setExecutions((data || []) as AgentExecution[]);
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    const newStatus = agent.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('ai_agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => 
        prev.map(a => 
          a.id === agentId ? { ...a, status: newStatus } : a
        )
      );

      toast({
        title: newStatus === 'active' ? "Agente activado" : "Agente desactivado",
        description: `El agente ${agent.name} está ahora ${newStatus === 'active' ? 'activo' : 'inactivo'}`,
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del agente",
        variant: "destructive",
      });
    }
  };

  const executeAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('agent_executions')
        .insert({
          agent_id: agentId,
          user_id: user?.id,
          status: 'running'
        });

      if (error) throw error;

      toast({
        title: "Agente ejecutándose",
        description: "El agente ha comenzado su ejecución",
      });

      // Refresh executions after a delay
      setTimeout(() => {
        fetchExecutions();
      }, 1000);
    } catch (error) {
      console.error('Error executing agent:', error);
      toast({
        title: "Error",
        description: "No se pudo ejecutar el agente",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      case "running": return "bg-primary text-primary-foreground";
      case "completed": return "bg-success text-success-foreground";
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "paused": return "Pausado";
      case "running": return "Ejecutando";
      case "completed": return "Completado";
      case "failed": return "Fallido";
      default: return "Desconocido";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando agentes IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar 
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
        <main className="flex-1 p-6 ml-64">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Agentes IA</h1>
                <p className="text-muted-foreground">Gestiona y monitorea tus agentes de inteligencia artificial</p>
              </div>
              <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Bot className="w-4 h-4 mr-2" />
                Crear Agente
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-primary">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Agentes</p>
                    <p className="text-2xl font-bold text-foreground">{agents.length}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success">
                    <Play className="w-5 h-5 text-success-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Activos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {agents.filter(a => a.status === 'active').length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ejecuciones</p>
                    <p className="text-2xl font-bold text-foreground">{executions.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-card border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning">
                    <AlertCircle className="w-5 h-5 text-warning-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fallidos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {executions.filter(e => e.status === 'failed').length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Agents Grid */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Agentes Activos</h2>
              {agents.length === 0 ? (
                <Card className="p-8 text-center bg-gradient-card border-border/50">
                  <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No hay agentes configurados
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Activa un workflow para crear tu primer agente IA
                  </p>
                  <Button variant="outline">
                    Ir a Workflows
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <Card 
                      key={agent.id}
                      className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm hover:shadow-card transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-primary">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{agent.name}</h3>
                            <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                              {getStatusText(agent.status)}
                            </Badge>
                          </div>
                        </div>
                        <Switch
                          checked={agent.status === 'active'}
                          onCheckedChange={() => toggleAgentStatus(agent.id)}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {agent.description || "Agente de IA automatizado"}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Workflow ID:</span>
                          <span className="text-foreground font-mono text-xs">{agent.workflow_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Creado:</span>
                          <span className="text-foreground">
                            {new Date(agent.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => executeAgent(agent.id)}
                          disabled={agent.status !== 'active'}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Ejecutar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Executions */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Ejecuciones Recientes</h2>
              <Card className="bg-gradient-card border-border/50">
                <div className="p-6">
                  {executions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay ejecuciones recientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executions.slice(0, 10).map((execution) => {
                        const agent = agents.find(a => a.id === execution.agent_id);
                        return (
                          <div key={execution.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                            <div className="flex items-center gap-3">
                              <Badge className={`text-xs ${getStatusColor(execution.status)}`}>
                                {getStatusText(execution.status)}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">
                                {agent?.name || 'Agente eliminado'}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(execution.created_at).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};