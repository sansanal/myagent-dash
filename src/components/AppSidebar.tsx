import { Bot, Workflow, BarChart3, Settings, Users, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useRoles } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
const { open } = useSidebar();
  const { hasRole } = useRoles();

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

  
  const baseItems = [
    { icon: Workflow, label: "Workflows", path: "/dashboard" },
    { icon: Bot, label: "Digital workers", path: "/agents" },
    { icon: CreditCard, label: "Facturación", path: "/billing" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Equipos", path: "/equipos" },
    { icon: Settings, label: "Configuración", path: "/configuracion" },
  ];

  const menuItems = [
    ...baseItems.slice(0, 3),
    ...(hasRole("superadmin") ? [{ icon: Users, label: "Usuarios activos", path: "/usuarios-activos" }] : []),
    ...baseItems.slice(3),
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
              <p className="text-xs text-muted-foreground">Digital workers manager</p>
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