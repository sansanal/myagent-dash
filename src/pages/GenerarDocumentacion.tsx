import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Upload, 
  Settings, 
  Zap,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Code,
  Database
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const GenerarDocumentacion = () => {
  const isMobile = useIsMobile();

  const documentTypes = [
    {
      id: "api",
      name: "Documentación de API",
      description: "Genera documentación automática para tus APIs REST",
      icon: Code,
      features: ["Endpoints", "Parámetros", "Respuestas", "Ejemplos"],
      color: "bg-blue-500"
    },
    {
      id: "database",
      name: "Documentación de base de datos",
      description: "Crea documentación completa de esquemas y relaciones",
      icon: Database,
      features: ["Esquemas", "Relaciones", "Índices", "Procedimientos"],
      color: "bg-green-500"
    },
    {
      id: "user",
      name: "Manual de usuario",
      description: "Genera guías de usuario detalladas y tutoriales",
      icon: Users,
      features: ["Tutoriales", "Capturas", "Pasos", "FAQ"],
      color: "bg-purple-500"
    },
    {
      id: "technical",
      name: "Documentación técnica",
      description: "Documentación técnica para desarrolladores",
      icon: BookOpen,
      features: ["Arquitectura", "Configuración", "Deployment", "Troubleshooting"],
      color: "bg-orange-500"
    }
  ];

  const recentDocuments = [
    {
      id: "1",
      name: "API documentation v2.1",
      type: "API",
      status: "completed",
      created: "Hace 2 horas",
      size: "2.3 MB"
    },
    {
      id: "2", 
      name: "User manual - Mobile app",
      type: "Manual",
      status: "processing",
      created: "Hace 1 día",
      size: "5.7 MB"
    },
    {
      id: "3",
      name: "Database schema v1.0",
      type: "Database",
      status: "completed",
      created: "Hace 3 días",
      size: "1.8 MB"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "processing":
        return "Procesando";
      case "error":
        return "Error";
      default:
        return "Desconocido";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-4 px-6 py-4 border-b">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Generador de Documentación</h1>
                <p className="text-sm text-muted-foreground">Crea documentación automática para tus proyectos</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4">
            <div className="w-full space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">24</p>
                      <p className="text-sm text-muted-foreground">Documentos generados</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">18</p>
                      <p className="text-sm text-muted-foreground">Completados</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">3</p>
                      <p className="text-sm text-muted-foreground">En proceso</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">12</p>
                      <p className="text-sm text-muted-foreground">Templates</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Document Types with Quick Actions */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Generar documentación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {documentTypes.map((type) => (
                    <Card key={type.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-lg ${type.color} text-white group-hover:scale-110 transition-transform`}>
                            <type.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">{type.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {type.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-auto space-y-2">
                          <Button className="w-full" size="sm">
                            <Zap className="w-4 h-4 mr-2" />
                            Generar
                          </Button>
                          <Button className="w-full" variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Importar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Recent Documents */}
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Documentos recientes</h2>
                </div>
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-muted-foreground">Nombre</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Tipo</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Creado</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Tamaño</th>
                          <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentDocuments.map((doc) => (
                          <tr key={doc.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-primary">
                                  <FileText className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{doc.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{doc.type}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(doc.status)}>
                                {getStatusText(doc.status)}
                              </Badge>
                            </td>
                            <td className="p-4 text-muted-foreground">{doc.created}</td>
                            <td className="p-4 text-muted-foreground">{doc.size}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default GenerarDocumentacion;
