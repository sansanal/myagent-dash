import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Bot, Play, Pause, Settings, Trash2, 
  TrendingUp, Calendar, Clock, AlertCircle, Mail, MessageSquare, Database, FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/useSubscription";
import { DashboardStats } from "@/components/DashboardStats";

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

interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: any;
  status: "active" | "inactive" | "paused";
  category: string;
  executions: number;
  lastRun: string;
  enabled: boolean;
}

export const AgentesIA = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, session } = useAuth();
  const { subscribed, createCheckout, loading: subscriptionLoading } = useSubscription();
  const isMobile = useIsMobile();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Clasificación de Emails",
      description: "Clasifica automáticamente emails entrantes según el contenido y prioridad",
      icon: Mail,
      status: "inactive",
      category: "Comunicación",
      executions: 1247,
      lastRun: "Hace 5 min",
      enabled: false
    },
    {
      id: "2", 
      name: "Generación de Contenido",
      description: "Crea contenido para redes sociales basado en tendencias y audiencia",
      icon: FileText,
      status: "inactive",
      category: "Marketing",
      executions: 892,
      lastRun: "Hace 15 min",
      enabled: false
    },
    {
      id: "3",
      name: "Análisis de Sentimientos",
      description: "Analiza comentarios y reviews para detectar sentimientos del cliente",
      icon: TrendingUp,
      status: "inactive",
      category: "Analytics",
      executions: 456,
      lastRun: "Hace 2 horas",
      enabled: false
    },
    {
      id: "4",
      name: "Chat Support Bot",
      description: "Bot de soporte automatizado para responder consultas frecuentes",
      icon: MessageSquare,
      status: "inactive",
      category: "Atención al Cliente",
      executions: 2145,
      lastRun: "Hace 1 min",
      enabled: false
    },
    {
      id: "5",
      name: "Backup Inteligente",
      description: "Backup automático de datos importantes con compresión IA",
      icon: Database,
      status: "inactive",
      category: "Operaciones",
      executions: 89,
      lastRun: "Hace 1 día",
      enabled: false
    },
    {
      id: "6",
      name: "Programador de Reuniones",
      description: "Coordina automáticamente reuniones según disponibilidad del equipo",
      icon: Calendar,
      status: "inactive",
      category: "Productividad",
      executions: 234,
      lastRun: "Hace 30 min",
      enabled: false
    }
  ]);

  // IDs de precio de Stripe por workflow (se autogeneran/aseguran desde el servidor)
  const [priceIds, setPriceIds] = useState<Record<string, string>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  const ensureStripePrices = async () => {
    try {
      setPricesLoading(true);
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      const workflowsPayload = [
        { id: '1', name: 'Clasificación de Emails', amount_cents: 9900 },
        { id: '2', name: 'Generación de Contenido', amount_cents: 29900 },
        { id: '3', name: 'Análisis de Sentimientos', amount_cents: 9900 },
        { id: '4', name: 'Chat Support Bot', amount_cents: 14900 },
        { id: '5', name: 'Backup Inteligente', amount_cents: 9900 },
        { id: '6', name: 'Programador de Reuniones', amount_cents: 14900 },
      ];
      const { data, error } = await supabase.functions.invoke('ensure-stripe-prices', {
        headers,
        body: { workflows: workflowsPayload },
      });
      if (error) throw error;
      setPriceIds(data?.priceIds || {});
    } catch (error) {
      console.error('Error ensuring Stripe prices:', error);
      toast({
        title: 'Error con Stripe',
        description: 'No se pudieron preparar los precios. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setPricesLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      ensureStripePrices();
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      fetchAgents();
      fetchExecutions();
      syncWorkflowsWithAgents();
    }
  }, [user]);

  const syncWorkflowsWithAgents = async () => {
    try {
      const { data: existingAgents, error } = await supabase
        .from('ai_agents')
        .select('workflow_id, status')
        .eq('user_id', user?.id);

      if (error) throw error;

      setWorkflows(prev => 
        prev.map(workflow => {
          const agent = existingAgents?.find(a => a.workflow_id === workflow.id);
          return {
            ...workflow,
            enabled: agent ? agent.status === 'active' : false,
            status: agent ? (agent.status as "active" | "inactive" | "paused") : 'inactive' as const
          };
        })
      );
    } catch (error) {
      console.error('Error syncing workflows:', error);
    }
  };

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

  const toggleWorkflow = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    const priceId = priceIds[id];
    if (!priceId) {
      toast({
        title: "Configurar precio",
        description: `Falta configurar el Price ID de Stripe para ${workflow.name}`,
        variant: "destructive",
      });
      return;
    }

    // Actualiza estado visual inmediato
    setWorkflows(prev => 
      prev.map(w => 
        w.id === id 
          ? { 
              ...w, 
              enabled: !w.enabled,
              status: !w.enabled ? "active" : "inactive"
            }
          : w
      )
    );

    try {
      // Llamar a Edge Function para gestionar item de suscripción
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      const action = !workflow.enabled ? 'activate' : 'deactivate';
      const { error } = await supabase.functions.invoke('manage-workflow-subscription', {
        headers,
        body: { action, price_id: priceId },
      });
      if (error) throw error;

      if (!workflow.enabled) {
        // Crear agente en BD
        const { error: insertError } = await supabase
          .from('ai_agents')
          .insert({
            user_id: user?.id,
            name: workflow.name,
            description: workflow.description,
            workflow_id: workflow.id,
            status: 'active',
            configuration: {
              category: workflow.category,
              executions: workflow.executions
            }
          });
        if (insertError) throw insertError;

        toast({ title: "Workflow activado", description: "Se añadió el ítem en Stripe y se creó el agente." });
        fetchAgents();
      } else {
        // Desactivar agente en BD
        const { error: updateError } = await supabase
          .from('ai_agents')
          .update({ status: 'inactive' })
          .eq('workflow_id', workflow.id)
          .eq('user_id', user?.id);
        if (updateError) throw updateError;

        toast({ title: "Workflow desactivado", description: "Se desactivó el ítem en Stripe (sin prorrateo)." });
        fetchAgents();
      }
    } catch (error) {
      console.error('Error managing workflow subscription:', error);
      // revertir cambio local si falla
      setWorkflows(prev => 
        prev.map(w => 
          w.id === id 
            ? { 
                ...w, 
                enabled: workflow.enabled,
                status: workflow.status
              }
            : w
        )
      );
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción en Stripe",
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
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/50 px-4">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold">Agentes IA</h2>
          </header>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <DashboardStats />
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

              {/* Workflows Section */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Workflows Disponibles</h2>
                {pricesLoading && (
                  <div className="mb-3 text-sm text-muted-foreground">Preparando precios de Stripe...</div>
                )}
                <div className="bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workflow</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Ejecuciones</TableHead>
                        <TableHead>Activado</TableHead>
                        <TableHead className="w-32">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workflows.map((workflow) => (
                        <TableRow key={workflow.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-primary">
                                <workflow.icon className="w-4 h-4 text-primary-foreground" />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{workflow.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {workflow.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
                              {getStatusText(workflow.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground">{workflow.category}</TableCell>
                          <TableCell className="text-foreground">
                            {workflow.executions.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={workflow.enabled}
                              onCheckedChange={() => toggleWorkflow(workflow.id)}
                              disabled={subscriptionLoading || pricesLoading || !priceIds[workflow.id]}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => executeAgent(agents.find(a => a.workflow_id === workflow.id)?.id || '')}
                                disabled={!workflow.enabled || !agents.find(a => a.workflow_id === workflow.id)}
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};