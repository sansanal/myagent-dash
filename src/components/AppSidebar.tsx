import { Bot, Workflow, BarChart3, Settings, Users, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

export const AppSidebar = () => {
  const { signOut, user } = useAuth();
  const { hasPaymentMethod, setupPaymentMethod, refreshPaymentStatus } = usePayment();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { open } = useSidebar();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const handleSetupPayment = async () => {
    try {
      await setupPaymentMethod();
      toast({
        title: "Redirigiendo a Stripe",
        description: "Se abrirá una nueva ventana para configurar tu tarjeta",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al configurar el método de pago",
        variant: "destructive",
      });
    }
  };

  const handleRefreshPayment = async () => {
    await refreshPaymentStatus();
    toast({
      title: "Estado actualizado",
      description: "Se ha verificado el estado de tu método de pago",
    });
  };
  
  const menuItems = [
    { icon: Workflow, label: "Workflows", path: "/" },
    { icon: Bot, label: "Agentes AI", path: "/agents" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Equipos", path: "/equipos" },
    { icon: Settings, label: "Configuración", path: "/configuracion" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={open ? "w-64" : "w-14"}
      collapsible="icon"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 p-6">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          {open && (
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Platform</h1>
              <p className="text-xs text-muted-foreground">Workflow Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.path)}
                    className={`gap-3 ${
                      isActive(item.path)
                        ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <button onClick={() => navigate(item.path)}>
                      <item.icon className="w-5 h-5" />
                      {open && <span>{item.label}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Payment Management Section - Only visible when sidebar is open */}
        {open && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-3 py-2">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">
                        {hasPaymentMethod ? "Tarjeta Configurada" : "Sin Tarjeta"}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {hasPaymentMethod 
                        ? "Tu método de pago está activo" 
                        : "Configura tu método de pago"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {hasPaymentMethod ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshPayment}
                        className="w-full text-xs"
                      >
                        Verificar Estado
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleSetupPayment}
                        className="w-full text-xs bg-gradient-to-r from-primary to-primary/80"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Configurar Tarjeta
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 border-t border-border/50">
          <div className={`flex items-center ${open ? 'justify-between' : 'justify-center'} p-3 rounded-lg bg-background/30`}>
            {open && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {user?.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  Usuario activo
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};