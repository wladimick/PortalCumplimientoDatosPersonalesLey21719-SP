"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/portal";

export async function createObligation(orgSlug: string, formData: FormData) {
  const { user, organization, membership } = await getOrganizationContext(orgSlug);
  if (!["org_admin", "compliance_manager", "contributor"].includes(membership.role)) throw new Error("No tienes permisos para crear obligaciones.");
  const supabase = await createClient();
  const code = String(formData.get("code") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const moduleId = String(formData.get("module_id") || "");
  if (!code || !title || !moduleId) throw new Error("Código, obligación y módulo son obligatorios.");
  const { data: module } = await supabase.from("compliance_modules").select("id").eq("organization_id", organization.id).eq("id", moduleId).maybeSingle();
  if (!module) throw new Error("El módulo no pertenece a esta organización.");
  const { data, error } = await supabase.from("obligations").insert({
    organization_id: organization.id,
    module_id: moduleId,
    code,
    title,
    description: String(formData.get("description") || "").trim() || null,
    legal_reference: String(formData.get("legal_reference") || "").trim() || null,
    priority: String(formData.get("priority") || "medium"),
    status: "pending",
    due_date: String(formData.get("due_date") || "") || null,
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({ organization_id: organization.id, actor_user_id: user.id, action: "obligation.created", entity_type: "obligation", entity_id: data.id, metadata: { code } });
  revalidatePath(`/app/${orgSlug}/cumplimiento`);
  revalidatePath(`/app/${orgSlug}/dashboard`);
}
