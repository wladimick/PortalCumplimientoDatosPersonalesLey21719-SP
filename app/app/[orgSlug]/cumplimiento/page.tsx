import { getComplianceData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";

export default async function CompliancePage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization } = await getOrganizationContext(orgSlug);
  const { modules, obligations } = await getComplianceData(organization.id);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Ley N° 21.719</span>
          <h1>Matriz de cumplimiento</h1>
          <p>Obligaciones organizadas por módulo, estado, prioridad y fecha objetivo. El contenido del piloto es demostrativo hasta validar el catálogo legal definitivo.</p>
        </div>
      </div>

      {modules.map((module: any) => {
        const items = obligations.filter((item: any) => item.module_id === module.id);
        return (
          <section className="card section-gap" key={module.id}>
            <div className="card-head">
              <div>
                <span className="eyebrow">{module.legal_reference || "Ley 21.719"}</span>
                <h2 style={{ marginTop: 8 }}>{module.name}</h2>
              </div>
              <span className="badge badge-neutral">{items.length} obligaciones</span>
            </div>
            <div className="card-body">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Obligación</th>
                      <th>Referencia</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Fecha objetivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id}>
                        <td><span className="code-inline">{item.code}</span></td>
                        <td>
                          <div className="table-title">{item.title}</div>
                          {item.description ? <div className="table-sub">{item.description}</div> : null}
                        </td>
                        <td className="small muted">{item.legal_reference || "—"}</td>
                        <td><StatusBadge value={item.priority} /></td>
                        <td><StatusBadge value={item.status} /></td>
                        <td className="small muted">{item.due_date ? new Intl.DateTimeFormat("es-CL").format(new Date(`${item.due_date}T12:00:00`)) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
