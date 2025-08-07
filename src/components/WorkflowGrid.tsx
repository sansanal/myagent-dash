import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bot, Mail, MessageSquare, Database, Calendar, 
  FileText, Image, TrendingUp, Play, Settings 
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

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

export const WorkflowGrid = () => {
  const { subscribed, createCheckout, openCustomerPortal, loading } = useSubscription();
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: "1",
      name: "Clasificación de Emails",
      description: "Clasifica automáticamente emails entrantes según el contenido y prioridad",
      icon: Mail,
      status: "active",
      category: "Comunicación",
      executions: 1247,
      lastRun: "Hace 5 min",
      enabled: true
    },
    {
      id: "2", 
      name: "Generación de Contenido",
      description: "Crea contenido para redes sociales basado en tendencias y audiencia",
      icon: FileText,
      status: "active",
      category: "Marketing",
      executions: 892,
      lastRun: "Hace 15 min",
      enabled: true
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
      status: "active",
      category: "Atención al Cliente",
      executions: 2145,
      lastRun: "Hace 1 min",
      enabled: true
    },
    {
      id: "5",
      name: "Backup Inteligente",
      description: "Backup automático de datos importantes con compresión IA",
      icon: Database,
      status: "paused",
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
      status: "active",
      category: "Productividad",
      executions: 234,
      lastRun: "Hace 30 min",
      enabled: true
    }
  ]);

  const toggleWorkflow = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    if (!workflow) return;

    // If trying to enable ANY workflow and user is not subscribed, show subscription requirement
    if (!workflow.enabled && !subscribed) {
      toast({
        title: "Suscripción Premium Requerida",
        description: "Con €150/mes obtienes acceso a TODOS los workflows premium. ¿Quieres suscribirte?",
        action: (
          <Button onClick={createCheckout} disabled={loading}>
            Suscribirse €150/mes
          </Button>
        ),
      });
      return;
    }

    // If subscribed, allow enabling/disabling any workflow freely
    if (subscribed) {
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

      toast({
        title: workflow.enabled ? "Workflow desactivado" : "Workflow activado",
        description: workflow.enabled 
          ? "El workflow se ha desactivado" 
          : "El workflow premium está ahora activo",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "paused": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Activo";
      case "inactive": return "Inactivo";
      case "paused": return "Pausado";
      default: return "Desconocido";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Workflows Disponibles</h2>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Bot className="w-4 h-4 mr-2" />
          Crear Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card 
            key={workflow.id} 
            className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm hover:shadow-card transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-primary">
                  <workflow.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {workflow.name}
                  </h3>
                  <Badge className={`text-xs ${getStatusColor(workflow.status)}`}>
                    {getStatusText(workflow.status)}
                  </Badge>
                </div>
              </div>
                <Switch
                  checked={workflow.enabled}
                  onCheckedChange={() => toggleWorkflow(workflow.id)}
                  disabled={loading}
                />
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {workflow.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="text-foreground">{workflow.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ejecuciones:</span>
                <span className="text-foreground">{workflow.executions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última ejecución:</span>
                <span className="text-foreground">{workflow.lastRun}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-border hover:bg-muted"
                disabled={!workflow.enabled}
              >
                <Play className="w-4 h-4 mr-2" />
                Ejecutar
              </Button>
              {subscribed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openCustomerPortal}
                  disabled={loading}
                  className="text-xs"
                >
                  Gestionar
                </Button>
              )}
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
    </div>
  );
};