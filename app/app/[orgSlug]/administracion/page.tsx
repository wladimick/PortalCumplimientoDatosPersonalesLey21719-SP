import { redirect } from "next/navigation";
import { Building2, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { getAdministrationData } from "@/lib/data/portal-data";
import { getOrganizationContext, getPlatformRole, roleLabel } from "@/lib/portal";
import { createCustomerOrganization, deleteCustomerOrganization, grantOrganizationAccess, revokeOrganizationAccess } from "./actions";

export default async function AdministrationPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const [{ organization }, platformRole] = await Promise.all([getOrganizationContext(orgSlug), getPlatformRole()]);
  if (!organization.is_internal || !platformRole) redirect(`/app/${orgSlug}/dashboard`);
  const { organizations, grants } = await getAdministrationData();
  const clients = organizations.filter((item: any) => !item.is_internal);
  const createAction = createCustomerOrganization.bind(null, orgSlug);
  const grantAction = grantOrganizationAccess.bind(null, orgSlug);
  const revokeAction = revokeOrganizationAccess.bind(null, orgSlug);
  const deleteAction = deleteCustomerOrganization.bind(null, orgSlug);

  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">Gobierno de plataforma</span><h1>Administración</h1><p>Crea clientes, asigna sus accesos y administra el ciclo de vida de cada organización. La autorización se valida en Supabase y no depende de ocultar opciones en React.</p></div><span className="badge badge-info">{roleLabel(platformRole)}</span></div>

      <section className="admin-grid">
        {platformRole === "platform_admin" ? <article className="card"><div className="card-head"><div><h2>Nuevo cliente</h2><p>Crea la organización y carga automáticamente la plantilla Ley 21.719 de TIBOX.</p></div><Building2 size={20} /></div><div className="card-body"><form action={createAction} className="compact-form"><div className="field"><label>Nombre del cliente</label><input className="input" name="name" placeholder="Prodata" minLength={2} maxLength={120} required /></div><div className="field"><label>RUT</label><input className="input" name="rut" placeholder="76.123.456-7" maxLength={32} /></div><div className="field"><label>Slug <span className="muted">· opcional</span></label><input className="input" name="slug" placeholder="prodata" pattern="[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ -]+" maxLength={80} /><span className="small muted">Si lo dejas vacío, se genera desde el nombre.</span></div><div className="field"><label>Administrador inicial</label><input className="input" name="initial_admin_email" type="email" placeholder="persona@empresa.cl" required /></div><div className="field"><label>Rol inicial</label><select className="select" name="initial_admin_role" defaultValue="org_admin"><option value="org_admin">Administrador cliente</option><option value="compliance_manager">Encargado de cumplimiento</option><option value="contributor">Responsable</option><option value="auditor">Auditor</option><option value="viewer">Solo lectura</option></select></div><button className="btn btn-primary" type="submit"><Building2 size={17} /> Crear cliente</button><span className="small muted">Se copian módulos, obligaciones y controles base; estados, fechas, responsables y evidencias comienzan limpios.</span></form></div></article> : null}

        <article className="card"><div className="card-head"><div><h2>Agregar acceso</h2><p>Autoriza otro correo para un cliente existente.</p></div><UserPlus size={20} /></div><div className="card-body"><form action={grantAction} className="compact-form"><div className="field"><label>Cliente</label><select className="select" name="organization_id" required>{organizations.map((item: any) => <option key={item.id} value={item.id}>{item.name}{item.is_internal ? " · Interno" : ""}</option>)}</select></div><div className="field"><label>Correo autorizado</label><input className="input" name="email" type="email" placeholder="persona@empresa.cl" required /></div><div className="field"><label>Rol</label><select className="select" name="role" defaultValue="viewer"><option value="viewer">Solo lectura</option><option value="auditor">Auditor</option><option value="contributor">Responsable</option><option value="compliance_manager">Encargado de cumplimiento</option><option value="org_admin">Administrador cliente</option></select></div><button className="btn btn-primary" type="submit">Agregar acceso</button></form></div></article>

        <article className="card"><div className="card-head"><div><h2>Resumen</h2><p>Clientes y accesos configurados.</p></div><UsersRound size={20} /></div><div className="card-body admin-stats"><div><strong>{clients.length}</strong><span>clientes</span></div><div><strong>{grants.filter((item: any) => item.status === "active").length}</strong><span>accesos activos</span></div><div><strong>{organizations.length}</strong><span>organizaciones</span></div></div></article>
      </section>

      <div className="client-admin-list">
        {organizations.map((client: any) => {
          const clientGrants = grants.filter((grant: any) => grant.organization_id === client.id);
          return <section className="card client-admin-card" key={client.id}><div className="card-head"><div><span className="eyebrow">{client.is_internal ? "Interno" : "Cliente"}</span><h2>{client.name}</h2><p>{client.slug}{client.rut ? ` · ${client.rut}` : ""}</p></div><span className={`badge ${client.status === "active" ? "badge-success" : "badge-neutral"}`}>{client.status === "active" ? "Activo" : "Inactivo"}</span></div><div className="card-body"><div className="access-list">{clientGrants.length ? clientGrants.map((grant: any) => <div className="access-row" key={grant.id}><div><strong>{grant.email}</strong><span>{roleLabel(grant.role)} · {grant.status === "active" ? "Activo" : "Revocado"}</span></div>{grant.status === "active" ? <form action={revokeAction}><input type="hidden" name="grant_id" value={grant.id} /><button className="btn btn-secondary btn-small" type="submit">Revocar</button></form> : null}</div>) : <div className="empty-inline">No hay correos autorizados mediante allowlist.</div>}</div></div>{!client.is_internal && platformRole === "platform_admin" ? <details className="danger-zone"><summary><Trash2 size={17} /> Eliminar cliente y sus datos</summary><div className="danger-content"><div><strong>Eliminación irreversible</strong><p>Elimina la organización, membresías, obligaciones, controles, acciones, evidencias registradas y auditoría del cliente. Los usuarios Auth sin ningún otro vínculo también se eliminan.</p></div><form action={deleteAction} className="compact-form"><input type="hidden" name="organization_id" value={client.id} /><div className="field"><label>Motivo</label><select className="select" name="reason_code"><option value="contract_ended">Fin de contrato</option><option value="customer_request">Solicitud del cliente</option><option value="data_retention_expired">Fin de retención</option><option value="test_cleanup">Limpieza de prueba</option></select></div><div className="field"><label>Escribe “{client.slug}” para confirmar</label><input className="input" name="confirmation_slug" required /></div><button className="btn btn-danger" type="submit"><Trash2 size={17} /> Eliminar definitivamente</button></form></div></details> : null}</section>;
        })}
      </div>
      <div className="security-note"><ShieldCheck size={18} /><span>El alta y la eliminación de clientes están reservadas a platform_admin. Ambas operaciones vuelven a validar permisos en PostgreSQL; la creación se ejecuta de forma transaccional.</span></div>
    </div>
  );
}
