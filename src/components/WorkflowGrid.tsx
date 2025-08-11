import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { 
  Bot, Mail, MessageSquare, Database, Calendar, 
  FileText, TrendingUp
} from "lucide-react";

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
  const workflows: Workflow[] = [
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
  ];


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
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Workflows disponibles</h2>
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

          </Card>
        ))}
      </div>
    </div>
  );
};