import { createClient } from "@/lib/supabase/server";

function pct(done: number, total: number) { return total > 0 ? Math.round((done / total) * 100) : 0; }

export async function getDashboardData(organizationId: string) {
  const supabase = await createClient();
  const [modulesRes, obligationsRes, controlsRes, actionsRes, evidenceRes] = await Promise.all([
    supabase.from("compliance_modules").select("id,module_key,name,description,legal_reference,sort_order").eq("organization_id", organizationId).order("sort_order"),
    supabase.from("obligations").select("id,module_id,status,priority,due_date,title").eq("organization_id", organizationId),
    supabase.from("security_controls").select("id,status,level,title,code,recommendation").eq("organization_id", organizationId),
    supabase.from("action_items").select("id,title,status,priority,due_date").eq("organization_id", organizationId).order("due_date", { ascending: true }).limit(8),
    supabase.from("evidence").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
  ]);
  const error = modulesRes.error || obligationsRes.error || controlsRes.error || actionsRes.error || evidenceRes.error;
  if (error) throw new Error(error.message);
  const obligations = obligationsRes.data ?? [];
  const controls = controlsRes.data ?? [];
  const activeObligations = obligations.filter((item: any) => item.status !== "not_applicable");
  const compliant = activeObligations.filter((item: any) => item.status === "compliant").length;
  const pending = activeObligations.filter((item: any) => item.status === "pending").length;
  const inProgress = activeObligations.filter((item: any) => item.status === "in_progress").length;
  const activeControls = controls.filter((item: any) => item.status !== "not_applicable");
  const compliantControls = activeControls.filter((item: any) => item.status === "compliant").length;
  const risks = activeControls.filter((item: any) => item.status !== "compliant" && ["advanced", "critical"].includes(item.level));
  const actions = actionsRes.data ?? [];
  const openActions = actions.filter((item: any) => item.status !== "done").length;
  const modules = (modulesRes.data ?? []).map((module: any) => { const items = obligations.filter((item: any) => item.module_id === module.id && item.status !== "not_applicable"); const done = items.filter((item: any) => item.status === "compliant").length; return { ...module, total: items.length, compliant: done, progress: pct(done, items.length) }; });
  return { metrics: { compliance: pct(compliant, activeObligations.length), technical: pct(compliantControls, activeControls.length), obligations: activeObligations.length, pending, inProgress, controls: activeControls.length, highRisks: risks.length, evidence: evidenceRes.count ?? 0, openActions }, modules, actions, risks: risks.slice(0, 6) };
}

export async function getComplianceData(organizationId: string) {
  const supabase = await createClient();
  const [modulesRes, obligationsRes] = await Promise.all([
    supabase.from("compliance_modules").select("id,module_key,name,legal_reference,sort_order").eq("organization_id", organizationId).order("sort_order"),
    supabase.from("obligations").select("id,module_id,code,title,description,legal_reference,status,priority,due_date,review_date,notes").eq("organization_id", organizationId).order("code"),
  ]);
  const error = modulesRes.error || obligationsRes.error; if (error) throw new Error(error.message); return { modules: modulesRes.data ?? [], obligations: obligationsRes.data ?? [] };
}

export async function getSecurityData(organizationId: string) {
  const supabase = await createClient();
  const [categoriesRes, controlsRes] = await Promise.all([
    supabase.from("security_categories").select("id,name,slug,sort_order").eq("organization_id", organizationId).order("sort_order"),
    supabase.from("security_controls").select("id,category_id,code,title,description,level,status,recommendation,review_date,notes").eq("organization_id", organizationId).order("code"),
  ]);
  const error = categoriesRes.error || controlsRes.error; if (error) throw new Error(error.message); return { categories: categoriesRes.data ?? [], controls: controlsRes.data ?? [] };
}

export async function getActionsData(organizationId: string) {
  const supabase = await createClient(); const { data, error } = await supabase.from("action_items").select("id,title,description,source_type,status,priority,due_date").eq("organization_id", organizationId).order("due_date", { ascending: true }); if (error) throw new Error(error.message); return data ?? [];
}

export async function getDecisionsData(organizationId: string) {
  const supabase = await createClient(); const { data, error } = await supabase.from("product_decisions").select("id,code,priority,category,question,recommendation,status,answer,answered_at").eq("organization_id", organizationId).order("code"); if (error) throw new Error(error.message); return data ?? [];
}

export async function searchOrganizationData(organizationId: string, query: string) {
  const supabase = await createClient();
  const safe = query.trim().slice(0, 100).replace(/[%,()_]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return { obligations: [], controls: [], actions: [] };
  const term = `%${safe}%`;
  const [obligationsRes, controlsRes, actionsRes] = await Promise.all([
    supabase.from("obligations").select("id,code,title,description,status,priority").eq("organization_id", organizationId).or(`title.ilike.${term},description.ilike.${term},code.ilike.${term}`).limit(20),
    supabase.from("security_controls").select("id,code,title,description,status,level").eq("organization_id", organizationId).or(`title.ilike.${term},description.ilike.${term},code.ilike.${term}`).limit(20),
    supabase.from("action_items").select("id,title,description,status,priority,due_date").eq("organization_id", organizationId).or(`title.ilike.${term},description.ilike.${term}`).limit(20),
  ]);
  const error = obligationsRes.error || controlsRes.error || actionsRes.error; if (error) throw new Error(error.message); return { obligations: obligationsRes.data ?? [], controls: controlsRes.data ?? [], actions: actionsRes.data ?? [] };
}

export async function getAdministrationData() {
  const supabase = await createClient();
  const [organizationsRes, grantsRes] = await Promise.all([
    supabase.from("organizations").select("id,name,slug,rut,status,is_internal,created_at").order("is_internal", { ascending: false }).order("name"),
    supabase.from("organization_access_grants").select("id,organization_id,email,role,status,created_at").order("created_at", { ascending: false }),
  ]);
  const error = organizationsRes.error || grantsRes.error; if (error) throw new Error(error.message); return { organizations: organizationsRes.data ?? [], grants: grantsRes.data ?? [] };
}
