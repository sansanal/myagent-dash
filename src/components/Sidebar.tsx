import { Bot, Workflow, BarChart3, Settings, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SidebarProps {
  selectedAccount: string;
  onAccountChange: (account: string) => void;
}

export const Sidebar = ({ selectedAccount, onAccountChange }: SidebarProps) => {
  const accounts = ["Cuenta Principal", "Cuenta Marketing", "Cuenta Ventas"];
  
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
      </div>
    </Card>
  );
};