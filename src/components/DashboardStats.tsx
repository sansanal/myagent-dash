import { Card } from "@/components/ui/card";
import { TrendingUp, Zap, CheckCircle, Clock } from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Workflows Activos",
      value: "12",
      change: "+2 esta semana",
      icon: Zap,
      color: "text-success"
    },
    {
      title: "Ejecuciones Hoy",
      value: "1,247",
      change: "+18% vs ayer",
      icon: TrendingUp,
      color: "text-primary"
    },
    {
      title: "Completadas",
      value: "1,189",
      change: "95.3% éxito",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Tiempo Promedio",
      value: "2.4s",
      change: "-0.3s vs ayer",
      icon: Clock,
      color: "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 bg-gradient-card border-border/50 backdrop-blur-sm hover:shadow-card transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs ${stat.color} mt-1`}>{stat.change}</p>
            </div>
            <div className={`p-3 rounded-lg bg-gradient-primary ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};