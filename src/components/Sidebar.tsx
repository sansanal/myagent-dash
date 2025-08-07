import { Bot, Workflow, BarChart3, Settings, ChevronDown, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  selectedAccount: string;
  onAccountChange: (account: string) => void;
}

export const Sidebar = ({ selectedAccount, onAccountChange }: SidebarProps) => {
  const accounts = ["Cuenta Principal", "Cuenta Marketing", "Cuenta Ventas"];
  const { signOut, user } = useAuth();
  const { toast } = useToast();

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
  
  const menuItems = [
    { icon: Workflow, label: "Workflows", active: true },
    { icon: Bot, label: "Agentes AI", active: false },
    { icon: BarChart3, label: "Analytics", active: false },
    { icon: Users, label: "Equipos", active: false },
    { icon: Settings, label: "Configuración", active: false },
  ];

  return (
    <Card className="fixed left-0 top-0 h-screen w-64 bg-gradient-card border-border/50 backdrop-blur-xl">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Platform</h1>
            <p className="text-xs text-muted-foreground">Workflow Manager</p>
          </div>
        </div>

        {/* Account Selector */}
        <div className="mb-6">
          <label className="text-sm text-muted-foreground mb-2 block">Cuenta Activa</label>
          <Button
            variant="outline"
            className="w-full justify-between bg-muted/50 border-border hover:bg-muted"
            onClick={() => {}}
          >
            <span className="text-foreground">{selectedAccount}</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                item.active 
                  ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {user?.email}
              </span>
              <span className="text-xs text-muted-foreground">
                Usuario activo
              </span>
            </div>
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
      </div>
    </Card>
  );
};