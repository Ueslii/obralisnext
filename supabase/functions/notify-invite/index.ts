import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

type InvitePayload = {
  inviteId?: string;
  construtoraId?: string;
  email?: string;
  cargoSugerido?: string | null;
  invitedBy?: string | null;
  createdBy?: string;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
// Prefer user-provided secret without reserved prefix; fallback to system if available
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "convites@notificacoes.local";
const APP_URL = Deno.env.get("APP_URL") ?? "";

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

serve(async (request) => {
  if (request.method !== "POST") {
    return respond(405, { error: "Method not allowed" });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL || !supabase) {
    console.error("Missing Supabase configuration");
    return respond(500, { error: "Server not configured" });
  }

  // If Authorization header is provided, validate it. Otherwise, allow internal calls without it.
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader && !authHeader.endsWith(SUPABASE_SERVICE_ROLE_KEY)) {
    return respond(403, { error: "Forbidden" });
  }

  let payload: InvitePayload;
  try {
    payload = (await request.json()) as InvitePayload;
  } catch (_error) {
    return respond(400, { error: "Invalid JSON payload" });
  }

  const construtoraId = payload.construtoraId?.trim();
  const inviteEmail = payload.email?.trim();
  if (!construtoraId || !inviteEmail) {
    return respond(400, { error: "Missing required invite data" });
  }

  const { data: construtora, error: construtoraError } = await supabase
    .from("construtoras")
    .select("id, nome, identificador")
    .eq("id", construtoraId)
    .single();

  if (construtoraError || !construtora) {
    console.error("Failed to load construtora", construtoraError);
    return respond(404, { error: "Construtora not found" });
  }

  const { data: membros, error: membrosError } = await supabase
    .from("construtora_membros")
    .select("user_id, role")
    .eq("construtora_id", construtoraId)
    .in("role", ["admin", "owner"]);

  if (membrosError) {
    console.error("Failed to load admins", membrosError);
    return respond(500, { error: "Could not list admins" });
  }

  const adminIds = new Set<string>();
  for (const membro of membros ?? []) {
    if (membro?.user_id) {
      adminIds.add(membro.user_id);
    }
  }

  if (adminIds.size === 0) {
    console.warn("No admin recipients found for construtora", construtoraId);
    return respond(200, { status: "No admins to notify" });
  }

  const adminEmails = new Set<string>();
  for (const userId of adminIds) {
    try {
      const { data: adminUser, error: adminError } =
        await supabase.auth.admin.getUserById(userId);
      if (adminError) {
        console.error("Failed to load admin user", userId, adminError);
        continue;
      }
      const email = adminUser.user?.email;
      if (email && email !== inviteEmail) {
        adminEmails.add(email);
      }
    } catch (error) {
      console.error("Unexpected error loading admin user", userId, error);
    }
  }

  if (adminEmails.size === 0) {
    console.warn("No admin emails found for construtora", construtoraId);
    return respond(200, { status: "No admin emails to notify" });
  }

  if (!RESEND_API_KEY) {
    console.warn(
      "RESEND_API_KEY not configured; skipping email for invite",
      payload.inviteId ?? "unknown",
    );
    return respond(200, { status: "Email skipped (no provider configured)" });
  }

  const subject = `Novo pedido de acesso - ${construtora.nome}`;
  const cargoInfo = payload.cargoSugerido
    ? `<p><strong>Cargo sugerido:</strong> ${payload.cargoSugerido}</p>`
    : "";
  const identificadorInfo = construtora.identificador
    ? `<p><strong>Código/CNPJ:</strong> ${construtora.identificador}</p>`
    : "";
  const manageUrl = APP_URL
    ? `${APP_URL.replace(/\/$/, "")}/configuracoes?tab=convites`
    : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2 style="color: #F97316; margin-bottom: 16px;">Novo convite pendente</h2>
      <p>O usuário <strong>${inviteEmail}</strong> solicitou acesso à construtora <strong>${construtora.nome}</strong>.</p>
      ${cargoInfo}
      ${identificadorInfo}
      <p>Analise o convite e aprove ou recuse para liberar o acesso.</p>
      ${
    manageUrl
      ? `<p><a href="${manageUrl}" style="background-color:#F97316;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;">Gerenciar convites</a></p>`
      : ""
  }
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
      <small style="color:#6b7280;">Você recebeu este e-mail porque é administrador(a) desta construtora no Obralis.</small>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: Array.from(adminEmails),
      subject,
      html: htmlBody,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "<no body>");
    console.error("Failed to send invite email", response.status, errorText);
    return respond(response.status, {
      error: "Failed to send email",
      details: errorText,
    });
  }

  return respond(200, { status: "Notifications sent" });
});
