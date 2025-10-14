import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ActivationEmailRequest {
  user_email?: string;
  workflow_name?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_email, workflow_name }: ActivationEmailRequest = await req.json();

    if (!user_email || !workflow_name) {
      return new Response(
        JSON.stringify({ error: "Missing user_email or workflow_name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const subject = `Workflow activado: ${workflow_name}`;
    const html = `
      <h2>Workflow activado</h2>
      <p>El usuario <strong>${user_email}</strong> ha activado el workflow <strong>${workflow_name}</strong>.</p>
      <p>En las próximas 24 horas se contactará para solicitar las credenciales necesarias.</p>
    `;

    const to = [user_email, "chaume@vlptech.es"]; // destinatarios

    const { error: emailError } = await resend.emails.send({
      from: "AI Platform <noreply@aiplatform.com>",
      to,
      subject,
      html,
    });

    if (emailError) {
      throw emailError;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-activation-email error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
