import Link from "next/link";
import { ArrowRight, Building2, Database, ShieldCheck } from "lucide-react";
import { getCurrentUser, getMemberships, roleLabel, SetupRequiredError } from "@/lib/portal";
import { TiboxBrand } from "@/components/brand/tibox-brand";

export default async function OrganizationPickerPage() {
  const user = await getCurrentUser();

  try {
    const memberships = await getMemberships();

    return (
      <main style={{ minHeight: "100vh", background: "var(--tbx-bg)" }}>
        <div className="brand-strip" />
        <div className="content" style={{ maxWidth: 1120, paddingTop: 54 }}>
          <TiboxBrand />

          <div className="page-head" style={{ marginTop: 54 }}>
            <div>
              <span className="eyebrow">Selecciona una organización</span>
              <h1>¿Dónde quieres trabajar?</h1>
              <p>Tu acceso puede incluir el espacio interno de TIBOX y uno o más clientes. Los datos se mantienen segregados por organización.</p>
            </div>
            <span className="badge badge-info">{user.email}</span>
          </div>

          {memberships.length ? (
            <div className="org-grid">
              {memberships.map(({ organization, role }) => (
                <Link key={organization.id} className="org-card" href={`/app/${organization.slug}/dashboard`}>
                  <Building2 size={24} color="var(--tbx-blue)" />
                  <h2>{organization.name}</h2>
                  <p>{organization.is_internal ? "Espacio interno de producto y decisiones" : "Vista del cliente y cumplimiento"}</p>
                  <div className="module-meta">
                    <span>{roleLabel(role)}</span>
                    <ArrowRight size={18} color="var(--tbx-brand)" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={28} color="var(--tbx-blue)" />
              <h2>Usuario sin organización asignada</h2>
              <p>El acceso está activo, pero todavía no existe una membresía para este usuario. Un administrador debe asociarlo a una organización.</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    if (!(error instanceof SetupRequiredError)) throw error;

    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div className="setup-box">
          <Database size={32} color="var(--tbx-blue)" />
          <h1>Falta instalar el esquema del MVP</h1>
          <p>La autenticación ya funciona, pero las tablas multi-tenant aún no existen. Ejecuta el archivo <span className="code-inline">supabase/migrations/20260826120000_initial_mvp.sql</span> en el SQL Editor de Supabase y vuelve a cargar.</p>
          <p className="small muted">El script también vincula temporalmente a los usuarios existentes con TIBOX y Cliente Demo para facilitar la revisión de Paula.</p>
        </div>
      </main>
    );
  }
}
