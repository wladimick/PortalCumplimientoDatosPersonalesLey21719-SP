import { CalendarClock } from "lucide-react";
import { getActionsData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";

export default async function ActionsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization } = await getOrganizationContext(orgSlug);
  const actions = await getActionsData(organization.id);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Seguimiento</span>
          <h1>Plan de acción</h1>
          <p>Tareas derivadas de obligaciones, controles y hallazgos. En la siguiente iteración se habilitará creación, asignación y cierre desde esta pantalla.</p>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <div><h2>Acciones abiertas</h2><p>Priorizadas por fecha y criticidad.</p></div>
          <span className="badge badge-info">{actions.filter((item: any) => item.status !== "done").length} activas</span>
        </div>
        <div className="card-body">
          {actions.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Acción</th><th>Origen</th><th>Prioridad</th><th>Estado</th><th>Vencimiento</th></tr></thead>
                <tbody>
                  {actions.map((item: any) => (
                    <tr key={item.id}>
                      <td><div className="table-title">{item.title}</div><div className="table-sub">{item.description || "Sin descripción"}</div></td>
                      <td className="small muted">{item.source_type || "Manual"}</td>
                      <td><StatusBadge value={item.priority} /></td>
                      <td><StatusBadge value={item.status} /></td>
                      <td className="small muted">{item.due_date ? new Intl.DateTimeFormat("es-CL").format(new Date(`${item.due_date}T12:00:00`)) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state"><CalendarClock size={28} color="var(--tbx-blue)" /><h2>Sin acciones</h2><p>Cuando se creen planes de mitigación aparecerán aquí.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}
