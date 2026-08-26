import { Plus } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/portal/data-table";
import { getComplianceData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { createObligation } from "./actions";

const columns: DataColumn[] = [
  { key: "code", label: "Código" },
  { key: "title", label: "Obligación", kind: "multiline", secondaryKey: "description" },
  { key: "module_name", label: "Módulo" },
  { key: "legal_reference", label: "Referencia" },
  { key: "priority", label: "Prioridad", kind: "badge" },
  { key: "status", label: "Estado", kind: "badge" },
  { key: "due_date", label: "Fecha objetivo", kind: "date" },
  { key: "review_date", label: "Revisión", kind: "date", defaultVisible: false },
];

export default async function CompliancePage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization, membership } = await getOrganizationContext(orgSlug);
  const { modules, obligations } = await getComplianceData(organization.id);
  const moduleMap = new Map(modules.map((module: any) => [module.id, module.name]));
  const rows = obligations.map((item: any) => ({ ...item, module_name: moduleMap.get(item.module_id) || "Sin módulo" }));
  const canEdit = ["org_admin", "compliance_manager", "contributor"].includes(membership.role);
  const action = createObligation.bind(null, orgSlug);

  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">Ley N° 21.719</span><h1>Matriz de cumplimiento</h1><p>Obligaciones, evidencia requerida, prioridad y fechas de seguimiento en una vista operativa configurable.</p></div>{canEdit ? <details className="create-menu"><summary className="btn btn-primary"><Plus size={17} /> Nueva obligación</summary><div className="create-popover"><form action={action} className="compact-form"><h2>Nueva obligación</h2><div className="form-grid"><div className="field"><label>Código</label><input className="input" name="code" required /></div><div className="field"><label>Módulo</label><select className="select" name="module_id" required>{modules.map((module: any) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></div></div><div className="field"><label>Obligación</label><input className="input" name="title" required /></div><div className="field"><label>Descripción</label><textarea className="textarea" name="description" /></div><div className="form-grid"><div className="field"><label>Referencia legal</label><input className="input" name="legal_reference" /></div><div className="field"><label>Prioridad</label><select className="select" name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></div><div className="field"><label>Fecha objetivo</label><input className="input" name="due_date" type="date" /></div></div><button className="btn btn-primary" type="submit">Crear obligación</button></form></div></details> : null}</div>
      <section className="card"><div className="card-head"><div><h2>Obligaciones</h2><p>{rows.length} registros · configura columnas según tu trabajo.</p></div></div><div className="card-body"><DataTable id={`obligaciones-${organization.id}`} columns={columns} rows={rows} filterKey="status" filterLabel="Estado" searchPlaceholder="Filtrar obligaciones…" /></div></section>
    </div>
  );
}
