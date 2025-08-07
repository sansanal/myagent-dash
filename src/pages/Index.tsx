import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WorkflowGrid } from "@/components/WorkflowGrid";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";

const Index = () => {
  const [selectedAccount, setSelectedAccount] = useState("Cuenta Principal");

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar 
          selectedAccount={selectedAccount}
          onAccountChange={setSelectedAccount}
        />
        <main className="flex-1 p-6 ml-64">
          <DashboardHeader selectedAccount={selectedAccount} />
          <DashboardStats />
          <WorkflowGrid />
        </main>
      </div>
    </div>
  );
};

export default Index;