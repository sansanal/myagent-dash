import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Bot, Mail, MessageSquare, Database, Calendar, 
  FileText, TrendingUp, Settings 
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Workflows Disponibles</h2>
        <Button className="bg-gradient-primary text-primary-foreground shadow-glow">
          <Bot className="w-4 h-4 mr-2" />
          Crear Workflow
        </Button>
      </div>

      <div className="bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Ejecuciones</TableHead>
              <TableHead>Última ejecución</TableHead>
              <TableHead className="w-20">Acciones</TableHead>
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
                <TableCell className="text-foreground">{workflow.lastRun}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};