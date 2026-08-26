import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OrganizationSummary = { id: string; name: string; slug: string; is_internal: boolean; status: string; };
export type MembershipSummary = { role: string; organization: OrganizationSummary; };

const knownNames: Record<string, string> = {
  "wdiaz@tibox.cl": "Wladimick Diaz",
  "pfarias@tibox.cl": "Paula Farías",
};

export class SetupRequiredError extends Error {
  constructor(message = "El esquema inicial de Supabase aún no está instalado.") { super(message); this.name = "SetupRequiredError"; }
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return data.user;
}

export function displayNameForUser(user: { email?: string | null; user_metadata?: Record<string, unknown> }) {
  const email = user.email?.toLowerCase() || "";
  return knownNames[email] || String(user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Usuario");
}

export async function getMemberships(): Promise<MembershipSummary[]> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("organization_memberships").select("role, organization:organizations(id,name,slug,is_internal,status)").eq("user_id", user.id).eq("status", "active");
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code ?? "")) throw new SetupRequiredError();
    throw new Error(error.message);
  }
  return (data ?? []).map((row: any) => ({ role: row.role as string, organization: Array.isArray(row.organization) ? row.organization[0] : row.organization })).filter((row: MembershipSummary) => Boolean(row.organization?.id));
}

export async function getPlatformRole() {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("platform_user_roles").select("role,status").eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (error && ["42P01", "PGRST205"].includes(error.code ?? "")) return null;
  if (error) throw new Error(error.message);
  return data?.role ?? null;
}

export async function getOrganizationContext(slug: string) {
  const [user, memberships] = await Promise.all([getCurrentUser(), getMemberships()]);
  const membership = memberships.find((item) => item.organization.slug === slug);
  if (!membership) redirect("/app");
  return { user, memberships, membership, organization: membership.organization };
}

export function roleLabel(role: string) {
  const labels: Record<string, string> = {
    platform_admin: "Administrador TIBOX",
    platform_support: "Soporte TIBOX",
    org_admin: "Administrador",
    compliance_manager: "Encargado de cumplimiento",
    contributor: "Responsable",
    auditor: "Auditor",
    viewer: "Solo lectura",
  };
  return labels[role] ?? role;
}

export function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "TC").trim();
  const pieces = source.split(/\s+|@/).filter(Boolean);
  return pieces.slice(0, 2).map((piece) => piece[0]?.toUpperCase()).join("") || "TC";
}
