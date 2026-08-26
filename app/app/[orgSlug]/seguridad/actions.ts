"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/portal";

export async function createSecurityControl(orgSlug: string, formData: FormData) {
  const { user, organization, membership } = await getOrganizationContext(orgSlug);
  if (!["org_admin", "compliance_manager", "contributor"].includes(membership.role)) throw new Error("No tienes permisos para crear controles.");
  const supabase = await createClient();
  const code = String(formData.get("code") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const categoryId = String(formData.get("category_id") || "");
  if (!code || !title || !categoryId) throw new Error("Código, control y categoría son obligatorios.");
  const { data: category } = await supabase.from("security_categories").select("id").eq("organization_id", organization.id).eq("id", categoryId).maybeSingle();
  if (!category) throw new Error("La categoría no pertenece a esta organización.");
  const { data, error } = await supabase.from("security_controls").insert({
    organization_id: organization.id,
    category_id: categoryId,
    code,
    title,
    description: String(formData.get("description") || "").trim() || null,
    level: String(formData.get("level") || "basic"),
    status: "pending",
    recommendation: String(formData.get("recommendation") || "").trim() || null,
    review_date: String(formData.get("review_date") || "") || null,
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({ organization_id: organization.id, actor_user_id: user.id, action: "security_control.created", entity_type: "security_control", entity_id: data.id, metadata: { code } });
  revalidatePath(`/app/${orgSlug}/seguridad`);
  revalidatePath(`/app/${orgSlug}/dashboard`);
}
