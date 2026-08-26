"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationContext, getPlatformRole } from "@/lib/portal";

const allowedGrantRoles = ["org_admin", "compliance_manager", "contributor", "auditor", "viewer"];

async function requireInternalAdmin(orgSlug: string, destructive = false) {
  const [{ user, organization }, platformRole] = await Promise.all([getOrganizationContext(orgSlug), getPlatformRole()]);
  if (!organization.is_internal || !platformRole) throw new Error("Esta operación está reservada para TIBOX.");
  if (destructive && platformRole !== "platform_admin") throw new Error("Solo un Administrador TIBOX puede eliminar clientes.");
  return { user, platformRole };
}

export async function grantOrganizationAccess(orgSlug: string, formData: FormData) {
  const { user } = await requireInternalAdmin(orgSlug);
  const supabase = await createClient();
  const organizationId = String(formData.get("organization_id") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "viewer");
  if (!organizationId || !email || !allowedGrantRoles.includes(role)) throw new Error("Datos de acceso inválidos.");
  const { error } = await supabase.from("organization_access_grants").upsert({ organization_id: organizationId, email, role, status: "active", created_by: user.id }, { onConflict: "organization_id,email" });
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({ organization_id: organizationId, actor_user_id: user.id, action: "access.granted", entity_type: "organization_access", metadata: { email, role } });
  revalidatePath(`/app/${orgSlug}/administracion`);
}

export async function revokeOrganizationAccess(orgSlug: string, formData: FormData) {
  const { user } = await requireInternalAdmin(orgSlug);
  const supabase = await createClient();
  const grantId = String(formData.get("grant_id") || "");
  const { data: grant, error: readError } = await supabase.from("organization_access_grants").select("id,organization_id,email,role").eq("id", grantId).single();
  if (readError || !grant) throw new Error("Acceso no encontrado.");
  const { error } = await supabase.from("organization_access_grants").update({ status: "inactive" }).eq("id", grantId);
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({ organization_id: grant.organization_id, actor_user_id: user.id, action: "access.revoked", entity_type: "organization_access", metadata: { email: grant.email, role: grant.role } });
  revalidatePath(`/app/${orgSlug}/administracion`);
}

export async function deleteCustomerOrganization(orgSlug: string, formData: FormData) {
  await requireInternalAdmin(orgSlug, true);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("La eliminación completa requiere SUPABASE_SERVICE_ROLE_KEY en Vercel.");
  const targetOrganizationId = String(formData.get("organization_id") || "");
  const confirmationSlug = String(formData.get("confirmation_slug") || "").trim();
  const reasonCode = String(formData.get("reason_code") || "contract_ended");
  const supabase = await createClient();
  const { data: affectedUsers, error } = await supabase.rpc("delete_customer_org", {
    target_org: targetOrganizationId,
    confirmation_slug: confirmationSlug,
    reason_code: reasonCode,
  });
  if (error) throw new Error(error.message);

  const admin = createAdminClient();
  for (const userId of (affectedUsers ?? []) as string[]) {
    const [memberships, platform] = await Promise.all([
      admin.from("organization_memberships").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
      admin.from("platform_user_roles").select("user_id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
    ]);
    if ((memberships.count ?? 0) === 0 && (platform.count ?? 0) === 0) await admin.auth.admin.deleteUser(userId);
  }
  revalidatePath(`/app/${orgSlug}/administracion`);
  revalidatePath("/app");
}
