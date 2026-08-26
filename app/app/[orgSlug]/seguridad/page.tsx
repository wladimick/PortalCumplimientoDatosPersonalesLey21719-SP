import { Plus } from "lucide-react";
import { DataTable, type DataColumn } from "@/components/portal/data-table";
import { getSecurityData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { createSecurityControl } from "./actions";

const columns: DataColumn[] = [
  { key: "title", label: "Control", kind: "multiline", secondaryKey: "code" },
  { key: "category_name", label: "Categoría" },
  { key: "description", label: "Descripción" },
  { key: "level", label: "Nivel", kind: "badge" },
  { key: "status", label: "Estado", kind: "badge" },
  { key: "recommendation", label: "Recomendación" },
  { key: "review_date", label: "Revisión", kind: "date" },
  { key: "notes", label: "Observaciones", defaultVisible: false },
];

export default async function SecurityPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization, membership } = await getOrganizationContext(orgSlug);
  const { categories, controls } = await getSecurityData(organization.id);
  const categoryMap = new Map(categories.map((category: any) => [category.id, category.name]));
  const rows = controls.map((item: any) => ({ ...item, category_name: categoryMap.get(item.category_id) || "Sin categoría" }));
  const canEdit = ["org_admin", "compliance_manager", "contributor"].includes(membership.role);
  const action = createSecurityControl.bind(null, orgSlug);

  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">Assessment técnico</span><h1>Seguridad y confidencialidad</h1><p>Controles técnicos y organizativos con filtros, columnas configurables y exportación.</p></div>{canEdit ? <details className="create-menu"><summary className="btn btn-primary"><Plus size={17} /> Nuevo control</summary><div className="create-popover"><form action={action} className="compact-form"><h2>Nuevo control</h2><div className="form-grid"><div className="field"><label>Código</label><input className="input" name="code" required /></div><div className="field"><label>Categoría</label><select className="select" name="category_id" required>{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div></div><div className="field"><label>Control</label><input className="input" name="title" required /></div><div className="field"><label>Descripción</label><textarea className="textarea" name="description" /></div><div className="form-grid"><div className="field"><label>Nivel</label><select className="select" name="level" defaultValue="basic"><option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option><option value="critical">Crítico</option></select></div><div className="field"><label>Fecha revisión</label><input className="input" name="review_date" type="date" /></div></div><div className="field"><label>Recomendación</label><textarea className="textarea" name="recommendation" /></div><button className="btn btn-primary" type="submit">Crear control</button></form></div></details> : null}</div>
      <section className="card"><div className="card-head"><div><h2>Assessment</h2><p>{rows.length} controles en {categories.length} categorías.</p></div></div><div className="card-body"><DataTable id={`seguridad-${organization.id}`} columns={columns} rows={rows} filterKey="status" filterLabel="Estado" searchPlaceholder="Filtrar controles…" /></div></section>
    </div>
  );
}
