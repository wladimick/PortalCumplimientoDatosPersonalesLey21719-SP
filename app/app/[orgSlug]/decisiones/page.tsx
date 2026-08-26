import { redirect } from "next/navigation";
import { CheckCircle2, MessageSquareText } from "lucide-react";
import { getDecisionsData } from "@/lib/data/portal-data";
import { getOrganizationContext } from "@/lib/portal";
import { StatusBadge } from "@/components/portal/status-badge";
import { saveDecision } from "./actions";

export default async function DecisionsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { organization, membership } = await getOrganizationContext(orgSlug);
  if (!organization.is_internal) redirect(`/app/${orgSlug}/dashboard`);

  const decisions = await getDecisionsData(organization.id);
  const canEdit = ["org_admin", "compliance_manager"].includes(membership.role);
  const resolved = decisions.filter((item: any) => item.status === "decided").length;
  const responded = decisions.filter((item: any) => ["answered", "decided"].includes(item.status)).length;

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <span className="eyebrow">Producto / Negocio</span>
          <h1>Decisiones para Paula</h1>
          <p>Estas respuestas congelan criterios de producto antes de implementar funcionalidades sensibles. Se registran con usuario y fecha en la auditoría.</p>
        </div>
      </div>

      <section className="kpi-grid">
        <article className="kpi-card"><div className="kpi-label"><span>Total</span><MessageSquareText size={18} color="var(--tbx-blue)" /></div><div className="kpi-value">{decisions.length}</div><div className="kpi-foot">Decisiones documentadas</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Respondidas</span><CheckCircle2 size={18} color="var(--tbx-blue)" /></div><div className="kpi-value">{responded}</div><div className="kpi-foot">Con respuesta registrada</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Cerradas</span><CheckCircle2 size={18} color="var(--tbx-success)" /></div><div className="kpi-value">{resolved}</div><div className="kpi-foot">Criterio aprobado</div></article>
        <article className="kpi-card"><div className="kpi-label"><span>Pendientes</span><MessageSquareText size={18} color="var(--tbx-warning)" /></div><div className="kpi-value">{decisions.length - responded}</div><div className="kpi-foot">Aún sin respuesta</div></article>
      </section>

      <div className="decision-list">
        {decisions.map((decision: any) => {
          const action = saveDecision.bind(null, orgSlug);
          return (
            <article className="decision-card" key={decision.id}>
              <div className="decision-top">
                <div>
                  <div className="decision-code">{decision.code} · {decision.category}</div>
                  <h2>{decision.question}</h2>
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <StatusBadge value={decision.priority} />
                  <StatusBadge value={decision.status} />
                </div>
              </div>

              {decision.recommendation ? <div className="decision-recommendation"><strong>Recomendación del equipo:</strong> {decision.recommendation}</div> : null}

              <form action={action} className="decision-form">
                <input type="hidden" name="decision_id" value={decision.id} />
                <div className="field">
                  <label htmlFor={`answer-${decision.id}`}>Respuesta / comentarios</label>
                  <textarea id={`answer-${decision.id}`} className="textarea" name="answer" defaultValue={decision.answer ?? ""} placeholder="Escribe aquí la decisión, criterio o comentarios…" disabled={!canEdit} />
                </div>
                <div className="field">
                  <label htmlFor={`status-${decision.id}`}>Estado</label>
                  <select id={`status-${decision.id}`} className="select" name="status" defaultValue={decision.status} disabled={!canEdit}>
                    <option value="pending">Pendiente</option>
                    <option value="answered">Respondida</option>
                    <option value="decided">Cerrada</option>
                  </select>
                </div>
                <button className="btn btn-primary" type="submit" disabled={!canEdit}>Guardar</button>
              </form>
              {!canEdit ? <p className="small muted">Tu rol tiene acceso de lectura a estas decisiones.</p> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
