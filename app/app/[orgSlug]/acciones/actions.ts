"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationContext } from "@/lib/portal";

export async function createActionItem(orgSlug: string, formData: FormData) {
  const { user, organization, membership } = await getOrganizationContext(orgSlug);
  if (!["org_admin", "compliance_manager", "contributor"].includes(membership.role)) throw new Error("No tienes permisos para crear acciones.");
  const supabase = await createClient();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("El título es obligatorio.");
  const { data, error } = await supabase.from("action_items").insert({
    organization_id: organization.id,
    title,
    description: String(formData.get("description") || "").trim() || null,
    source_type: "manual",
    status: "open",
    priority: String(formData.get("priority") || "medium"),
    due_date: String(formData.get("due_date") || "") || null,
    created_by: user.id,
  }).select("id").single();
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({ organization_id: organization.id, actor_user_id: user.id, action: "action.created", entity_type: "action_item", entity_id: data.id, metadata: {} });
  revalidatePath(`/app/${orgSlug}/acciones`);
  revalidatePath(`/app/${orgSlug}/dashboard`);
}
