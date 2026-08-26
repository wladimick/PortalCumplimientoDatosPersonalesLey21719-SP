import { Plus } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/portal/data-table";
import { getActionsData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { createActionItem } from "./actions";

const columns: DataColumn[] = [
  { key: "title", label: "Acción", kind: "multiline", secondaryKey: "description" },
  { key: "source_type", label: "Origen" },
  { key: "priority", label: "Prioridad", kind: "badge" },
  { key: "status", label: "Estado", kind: "badge" },
  { key: "due_date", label: "Vencimiento", kind: "date" },
];

export default async function ActionsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization, membership } = await getOrganizationContext(orgSlug);
  const actions = await getActionsData(organization.id);
  const canEdit = ["org_admin", "compliance_manager", "contributor"].includes(membership.role);
  const action = createActionItem.bind(null, orgSlug);
  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">Seguimiento</span><h1>Plan de acción</h1><p>Tareas derivadas de obligaciones, controles, hallazgos y trabajo manual.</p></div>{canEdit ? <details className="create-menu"><summary className="btn btn-primary"><Plus size={17} /> Nueva acción</summary><div className="create-popover"><form action={action} className="compact-form"><h2>Nueva acción</h2><div className="field"><label>Acción</label><input className="input" name="title" required /></div><div className="field"><label>Descripción</label><textarea className="textarea" name="description" /></div><div className="form-grid"><div className="field"><label>Prioridad</label><select className="select" name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></div><div className="field"><label>Vencimiento</label><input className="input" type="date" name="due_date" /></div></div><button className="btn btn-primary" type="submit">Crear acción</button></form></div></details> : null}</div>
      <section className="card"><div className="card-head"><div><h2>Acciones</h2><p>{actions.filter((item: any) => item.status !== "done").length} activas · {actions.length} totales</p></div></div><div className="card-body"><DataTable id={`acciones-${organization.id}`} columns={columns} rows={actions} filterKey="status" filterLabel="Estado" searchPlaceholder="Filtrar acciones…" /></div></section>
    </div>
  );
}
