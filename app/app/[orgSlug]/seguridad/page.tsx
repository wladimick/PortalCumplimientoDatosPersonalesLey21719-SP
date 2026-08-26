import { getSecurityData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";

export default async function SecurityPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization } = await getOrganizationContext(orgSlug);
  const { categories, controls } = await getSecurityData(organization.id);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Assessment técnico</span>
          <h1>Seguridad y confidencialidad</h1>
          <p>Controles técnicos y organizativos agrupados por categoría para identificar brechas y acciones de mitigación.</p>
        </div>
      </div>

      {categories.map((category: any) => {
        const items = controls.filter((item: any) => item.category_id === category.id);
        return (
          <section className="card section-gap" key={category.id}>
            <div className="card-head">
              <div><h2>{category.name}</h2><p>{items.length} controles evaluados</p></div>
            </div>
            <div className="card-body">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Control</th>
                      <th>Descripción</th>
                      <th>Nivel</th>
                      <th>Estado</th>
                      <th>Recomendación</th>
                      <th>Revisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any) => (
                      <tr key={item.id}>
                        <td><div className="table-title">{item.title}</div><div className="table-sub">{item.code}</div></td>
                        <td className="small muted">{item.description || "—"}</td>
                        <td><StatusBadge value={item.level} /></td>
                        <td><StatusBadge value={item.status} /></td>
                        <td className="small muted">{item.recommendation || "—"}</td>
                        <td className="small muted">{item.review_date ? new Intl.DateTimeFormat("es-CL").format(new Date(`${item.review_date}T12:00:00`)) : "—"}</td>
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
