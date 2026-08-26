import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { getDashboardData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";

export default async function DashboardPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization } = await getOrganizationContext(orgSlug);
  const { metrics, modules, actions } = await getDashboardData(organization.id);

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Resumen ejecutivo</span>
          <h1>{organization.name}</h1>
          <p>Estado general del cumplimiento, controles técnicos y acciones prioritarias.</p>
        </div>
      </div>

      <section className="hero-panel">
        <h2>{organization.is_internal ? "Piloto TIBOX Compliance" : "Centro de cumplimiento y evidencias"}</h2>
        <p>
          {organization.is_internal
            ? "Este espacio permite a Paula revisar la experiencia, navegar el modelo y responder las decisiones de producto antes de cerrar el alcance del MVP."
            : "Prioriza obligaciones, gestiona responsables y concentra la evidencia necesaria para demostrar avance."}
        </p>
      </section>

      <section className="kpi-grid" aria-label="Indicadores principales">
        <article className="kpi-card">
          <div className="kpi-label"><span>Cumplimiento</span><CheckCircle2 size={18} color="var(--tbx-success)" /></div>
          <div className="kpi-value">{metrics.compliance}%</div>
          <div className="kpi-foot">Obligaciones marcadas como cumplidas</div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label"><span>Obligaciones</span><ClipboardList size={18} color="var(--tbx-blue)" /></div>
          <div className="kpi-value">{metrics.obligations}</div>
          <div className="kpi-foot">{metrics.inProgress} en proceso · {metrics.pending} pendientes</div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label"><span>Controles técnicos</span><ShieldCheck size={18} color="var(--tbx-blue)" /></div>
          <div className="kpi-value">{metrics.controls}</div>
          <div className="kpi-foot">Assessment de seguridad del cliente</div>
        </article>
        <article className="kpi-card">
          <div className="kpi-label"><span>Riesgos altos</span><AlertTriangle size={18} color="var(--tbx-danger)" /></div>
          <div className="kpi-value">{metrics.highRisks}</div>
          <div className="kpi-foot">Controles avanzados aún no cumplidos</div>
        </article>
      </section>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <div><h2>Módulos de cumplimiento</h2><p>Avance por ámbito de la Ley 21.719.</p></div>
            <Link className="btn btn-secondary" href={`/app/${orgSlug}/cumplimiento`}>Ver matriz</Link>
          </div>
          <div className="card-body">
            <div className="module-grid">
              {modules.map((module: any) => (
                <article className="module-card" key={module.id}>
                  <span className="eyebrow">{module.legal_reference || "Ley 21.719"}</span>
                  <h3>{module.name}</h3>
                  <p>{module.description}</p>
                  <div className="progress"><span style={{ width: `${module.progress}%` }} /></div>
                  <div className="module-meta"><span>{module.compliant}/{module.total} cumplidas</span><strong>{module.progress}%</strong></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="card">
          <div className="card-head">
            <div><h2>Próximas acciones</h2><p>Elementos que requieren seguimiento.</p></div>
          </div>
          <div className="card-body">
            {actions.length ? (
              <div className="list-stack">
                {actions.map((action: any) => (
                  <div className="list-row" key={action.id}>
                    <div>
                      <strong>{action.title}</strong>
                      <span>{action.due_date ? `Vence ${new Intl.DateTimeFormat("es-CL").format(new Date(`${action.due_date}T12:00:00`))}` : "Sin fecha"}</span>
                    </div>
                    <StatusBadge value={action.priority} />
                  </div>
                ))}
              </div>
            ) : <p className="muted small">No hay acciones registradas.</p>}
          </div>
        </aside>
      </div>

      {organization.is_internal ? (
        <section className="card section-gap">
          <div className="card-head">
            <div><h2>Decisiones pendientes de producto</h2><p>Paula puede responderlas directamente desde el piloto; quedarán guardadas y auditadas.</p></div>
            <Link className="btn btn-primary" href={`/app/${orgSlug}/decisiones`}>Responder decisiones</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
