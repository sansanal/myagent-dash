import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppSidebar } from "@/components/AppSidebar";
import { CreditCard, Plus, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodItem {
  id: string;
  brand?: string;
  last4?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

interface InvoiceItem {
  id: string;
  number?: string | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  currency?: string | null;
  status?: string | null;
  hosted_invoice_url?: string | null;
  created?: string | null;
  period_end?: string | null;
}

interface SubscriptionSummary {
  id: string;
  status: string;
  unit_amount: number;
  currency: string;
  quantity: number;
  monthly_total: number;
  current_period_end: string | null;
}

const Billing = () => {
  const { session } = useAuth();
  const { setupPaymentMethod } = usePayment();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);

  const defaultPmId = useMemo(() => paymentMethods.find((pm) => pm.is_default)?.id || null, [paymentMethods]);

  useEffect(() => {
    document.title = "Facturación y pagos - AI Platform";
  }, []);

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [{ data: pmData, error: pmError }, { data: billingData, error: billError }] = await Promise.all([
        supabase.functions.invoke("list-payment-methods", { headers }),
        supabase.functions.invoke("get-billing-summary", { headers }),
      ]);
      if (pmError) throw pmError;
      if (billError) throw billError;

      const list: PaymentMethodItem[] = pmData?.paymentMethods || [];
      setPaymentMethods(list);
      setInvoices(billingData?.invoices || []);
      setSubscription(billingData?.subscription || null);

      // Garantizar que siempre haya una tarjeta predeterminada
      if (list.length > 0 && !list.some((p) => p.is_default)) {
        await handleSetDefault(list[0].id);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo cargar la facturación.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  // Refresh payment methods when returning from Stripe (tab focus)
  useEffect(() => {
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleSetDefault = async (payment_method_id: string) => {
    if (!session) return;
    setUpdating(true);
    try {
      const { error } = await supabase.functions.invoke("set-default-payment-method", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { payment_method_id },
      });
      if (error) throw error;
      setPaymentMethods((prev) => prev.map((pm) => ({ ...pm, is_default: pm.id === payment_method_id })));
      toast({ title: "Actualizado", description: "Tarjeta predeterminada actualizada." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo actualizar la tarjeta predeterminada.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddCard = async () => {
    try {
      await setupPaymentMethod();
      toast({ title: "Abrir Stripe", description: "Añade una nueva tarjeta en la ventana emergente." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo iniciar el alta de tarjeta.", variant: "destructive" });
    }
  };

  const formatAmount = (cents?: number | null, currency?: string | null) => {
    if (cents == null) return "-";
    const value = (cents / 100).toFixed(2);
    return `${value} ${String(currency || 'usd').toUpperCase()}`;
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border/50 px-4">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg font-semibold">Facturación y pagos</h2>
          </header>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Métodos de pago</h3>
                  <Button size="sm" onClick={handleAddCard} disabled={updating}>
                    <Plus className="mr-1 h-4 w-4" /> Añadir tarjeta
                  </Button>
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethods.length === 0 ? (
                      <Card>
                        <CardContent className="py-6 text-sm text-muted-foreground">
                          No hay tarjetas guardadas. Añade una para continuar.
                        </CardContent>
                      </Card>
                    ) : (
                      <RadioGroup
                        value={defaultPmId ?? undefined}
                        onValueChange={(val) => {
                          if (val && val !== defaultPmId) handleSetDefault(val);
                        }}
                        className="space-y-2"
                      >
                        {paymentMethods.map((pm) => (
                          <Card key={pm.id} className="border-border/60">
                            <CardHeader className="py-3 flex flex-row items-center justify-between">
                              <div className="flex items-center gap-3">
                                <RadioGroupItem id={`pm-${pm.id}`} value={pm.id} />
                                <CardTitle className="text-sm flex items-center gap-2">
                                  <CreditCard className="h-4 w-4 text-primary" />
                                  {pm.brand?.toUpperCase()} •••• {pm.last4}
                                  {pm.is_default && <Badge variant="secondary">Predeterminada</Badge>}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Exp. {pm.exp_month}/{pm.exp_year}</span>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-medium text-foreground mb-3">Resumen de suscripción</h3>
                <Card>
                  <CardContent className="py-4 text-sm">
                    {subscription ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-muted-foreground">Workflows activos</div>
                          <div className="font-medium">{subscription.quantity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Precio mensual</div>
                          <div className="font-medium">{formatAmount(subscription.monthly_total, subscription.currency)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Próximo cobro</div>
                          <div className="font-medium">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '-'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Estado</div>
                          <div className="font-medium capitalize">{subscription.status}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No hay suscripción activa.</div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section>
                <h3 className="text-sm font-medium text-foreground mb-3">Histórico de pagos</h3>
                {loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Cargando…</div>
                ) : invoices.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Sin facturas todavía.</div>
                ) : (
                  <div className="rounded-md border border-border/60 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Importe</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Factura</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="text-sm">{inv.created ? new Date(inv.created).toLocaleDateString() : '-'}</TableCell>
                            <TableCell className="text-sm">{formatAmount(inv.amount_paid ?? inv.amount_due, inv.currency)}</TableCell>
                            <TableCell className="text-sm capitalize">{inv.status}</TableCell>
                            <TableCell className="text-sm">
                              {inv.hosted_invoice_url ? (
                                <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer" className="text-primary underline">
                                  Ver factura
                                </a>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Billing;
