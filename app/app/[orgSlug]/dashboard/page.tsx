import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, FileCheck2, ListTodo, ShieldCheck, ArrowRight } from "lucide-react";
import { getDashboardData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";
import { TiboxBrand } from "@/components/brand/tibox-brand";
import { GlobalSearch } from "@/components/portal/global-search";
import { AccessibilityControls } from "@/components/portal/accessibility-controls";

export default async function DashboardPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization } = await getOrganizationContext(orgSlug);
  const { metrics, modules, actions, risks } = await getDashboardData(organization.id);
  const external = !organization.is_internal;

  return (
    <div className={external ? "executive-content" : "content"}>
      {external ? (
        <div className="executive-topline">
          <div><TiboxBrand /><span className="executive-client">{organization.name}</span></div>
          <div className="executive-actions"><AccessibilityControls compact /><Link className="btn btn-secondary" href={`/app/${orgSlug}/cumplimiento`}>Abrir portal <ArrowRight size={17} /></Link></div>
        </div>
      ) : null}

      <div className={external ? "executive-heading" : "page-head"}>
        <div>
          <span className="eyebrow">Resumen ejecutivo</span>
          <h1>{external ? "Estado de cumplimiento" : organization.name}</h1>
          <p>Visión consolidada de obligaciones, controles técnicos, evidencias, riesgos y acciones prioritarias.</p>
        </div>
        {external ? <GlobalSearch orgSlug={orgSlug} compact /> : null}
      </div>

      <section className="kpi-grid kpi-grid-6" aria-label="Indicadores principales">
        <article className="kpi-card"><div className="kpi-label"><span>Cumplimiento documental</span><CheckCircle2 size={18} /></div><div className="kpi-value">{metrics.compliance}%</div><div className="kpi-foot">{metrics.inProgress} en proceso · {metrics.pending} pendientes</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Postura técnica</span><ShieldCheck size={18} /></div><div className="kpi-value">{metrics.technical}%</div><div className="kpi-foot">{metrics.controls} controles evaluados</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Obligaciones</span><ClipboardList size={18} /></div><div className="kpi-value">{metrics.obligations}</div><div className="kpi-foot">Ley 21.719</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Evidencias</span><FileCheck2 size={18} /></div><div className="kpi-value">{metrics.evidence}</div><div className="kpi-foot">Documentos registrados</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Acciones abiertas</span><ListTodo size={18} /></div><div className="kpi-value">{metrics.openActions}</div><div className="kpi-foot">Seguimiento activo</div></article>
        <article className="kpi-card danger-kpi"><div className="kpi-label"><span>Riesgos altos</span><AlertTriangle size={18} /></div><div className="kpi-value">{metrics.highRisks}</div><div className="kpi-foot">Controles avanzados/críticos sin cerrar</div></article>
      </section>

      <div className="dashboard-grid">
        <section className="card dashboard-modules">
          <div className="card-head"><div><h2>Módulos de cumplimiento</h2><p>Avance por ámbito.</p></div><Link className="text-link" href={`/app/${orgSlug}/cumplimiento`}>Ver matriz <ArrowRight size={15} /></Link></div>
          <div className="card-body"><div className="module-grid">{modules.map((module: any) => <article className="module-card" key={module.id}><span className="module-reference">{module.legal_reference || "Ley 21.719"}</span><h3>{module.name}</h3><p>{module.description}</p><div className="progress"><span style={{ width: `${module.progress}%` }} /></div><div className="module-meta"><span>{module.compliant}/{module.total} cumplidas</span><strong>{module.progress}%</strong></div></article>)}</div></div>
        </section>

        <div className="dashboard-side">
          <section className="card"><div className="card-head"><div><h2>Próximas acciones</h2><p>Elementos que requieren seguimiento.</p></div></div><div className="card-body">{actions.length ? <div className="list-stack">{actions.map((action: any) => <div className="list-row" key={action.id}><div><strong>{action.title}</strong><span>{action.due_date ? `Vence ${new Intl.DateTimeFormat("es-CL").format(new Date(`${action.due_date}T12:00:00`))}` : "Sin fecha"}</span></div><StatusBadge value={action.priority} /></div>)}</div> : <p className="muted small">No hay acciones registradas.</p>}</div></section>
          <section className="card"><div className="card-head"><div><h2>Riesgos prioritarios</h2><p>Controles técnicos aún no cumplidos.</p></div></div><div className="card-body">{risks.length ? <div className="list-stack">{risks.map((risk: any) => <div className="list-row" key={risk.id}><div><strong>{risk.title}</strong><span>{risk.code}</span></div><StatusBadge value={risk.level} /></div>)}</div> : <div className="positive-state"><CheckCircle2 size={20} /> Sin riesgos altos pendientes.</div>}</div></section>
        </div>
      </div>

      {organization.is_internal ? <section className="card section-gap"><div className="card-head"><div><h2>Decisiones pendientes de producto</h2><p>Paula puede responderlas desde el piloto y quedan auditadas.</p></div><Link className="btn btn-primary" href={`/app/${orgSlug}/decisiones`}>Responder decisiones</Link></div></section> : null}
      {external ? <footer className="executive-footer"><span>TIBOX Compliance</span><span>Actualizado {new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(new Date())}</span></footer> : null}
    </div>
  );
}
