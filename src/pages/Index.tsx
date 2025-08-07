import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { WorkflowGrid } from "@/components/WorkflowGrid";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState("Cuenta Principal");
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/50 px-4">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </header>
          <div className="flex-1 p-6">
            <DashboardHeader selectedAccount={selectedAccount} />
            <DashboardStats />
            <WorkflowGrid />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;