"use server";

import { revalidatePath } from "next/cache";
import { getOrganizationContext } from "@/lib/portal";
import { createClient } from "@/lib/supabase/server";

const editableRoles = new Set(["org_admin", "compliance_manager"]);
const allowedStatuses = new Set(["pending", "answered", "decided"]);

export async function saveDecision(orgSlug: string, formData: FormData) {
  const { user, organization, membership } = await getOrganizationContext(orgSlug);

  if (!organization.is_internal || !editableRoles.has(membership.role)) {
    throw new Error("No tienes permisos para modificar decisiones de producto.");
  }

  const decisionId = String(formData.get("decision_id") || "");
  const answer = String(formData.get("answer") || "").trim().slice(0, 5000);
  const requestedStatus = String(formData.get("status") || "pending");
  const status = allowedStatuses.has(requestedStatus) ? requestedStatus : "pending";

  if (!decisionId) throw new Error("Falta el identificador de la decisión.");

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("product_decisions")
    .select("id,code,answer,status")
    .eq("id", decisionId)
    .eq("organization_id", organization.id)
    .single();

  if (readError || !existing) throw new Error("No fue posible validar la decisión.");

  const { error: updateError } = await supabase
    .from("product_decisions")
    .update({
      answer,
      status,
      answered_by: user.id,
      answered_at: answer ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", decisionId)
    .eq("organization_id", organization.id);

  if (updateError) throw new Error(updateError.message);

  await supabase.from("audit_events").insert({
    organization_id: organization.id,
    actor_user_id: user.id,
    action: "product_decision.updated",
    entity_type: "product_decision",
    entity_id: decisionId,
    metadata: {
      code: existing.code,
      previous_status: existing.status,
      new_status: status,
      answer_changed: existing.answer !== answer,
    },
  });

  revalidatePath(`/app/${orgSlug}/decisiones`);
  revalidatePath(`/app/${orgSlug}/dashboard`);
}
