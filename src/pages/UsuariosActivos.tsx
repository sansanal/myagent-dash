import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRoles } from "@/hooks/useRoles";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
interface ActiveUserItem {
  user_id: string;
  full_name: string | null;
  email: string;
  workflows_active: number;
  price_monthly_cents: number;
  currency: string | null;
}

export default function UsuariosActivos() {
  const [data, setData] = useState<ActiveUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasRole, loading: rolesLoading } = useRoles();
  const isMobile = useIsMobile();
  useEffect(() => {
    // SEO basics
    document.title = "Usuarios activos | Superadmin";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Listado de usuarios activos con workflows y precio mensual");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("list-active-users", { body: { includePrices: false } });
      if (error) {
        setError(error.message);
        setData([]);
      } else {
        setData((data?.users as ActiveUserItem[]) || []);
      }
      setLoading(false);
    };

    if (hasRole("superadmin")) fetchData();
  }, [hasRole]);

  const formatPrice = useMemo(() => (cents: number, currency?: string | null) => {
    if (!currency || !cents) return "-";
    try {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(cents / 100);
    } catch {
      return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
    }
  }, []);

  if (!rolesLoading && !hasRole("superadmin")) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="min-h-screen bg-background flex w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <header className="h-12 flex items-center border-b border-border/50 px-4">
              <SidebarTrigger className="mr-4" />
              <h2 className="text-lg font-semibold">Usuarios activos</h2>
            </header>
            <div className="flex-1 p-6">
              <Card>
                <CardHeader>
                  <CardTitle>No autorizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Esta sección solo está disponible para el rol superadmin.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/50 px-4">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold">Usuarios activos</h2>
          </header>
          <div className="flex-1 p-6">
            <link rel="canonical" href={`${window.location.origin}/usuarios-activos`} />

            <Card>
              <CardHeader>
                <CardTitle>Listado</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Cargando...</p>
                ) : error ? (
                  <p className="text-destructive">{error}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Workflows activos</TableHead>
                        <TableHead>Precio mensual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell>{u.full_name || "—"}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.workflows_active}</TableCell>
                          <TableCell>
                            {formatPrice(u.price_monthly_cents, u.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No hay usuarios para mostrar
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
