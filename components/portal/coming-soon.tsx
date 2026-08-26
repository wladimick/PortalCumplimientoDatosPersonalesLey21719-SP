import type { LucideIcon } from "lucide-react";

export function ComingSoon({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: LucideIcon }) {
  return (
    <div className="content">
      <div className="page-head"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>
      <div className="empty-state"><Icon size={30} color="var(--tbx-blue)" /><h2>Preparado para la siguiente iteración</h2><p>El módulo ya forma parte de la navegación y del modelo de datos, pero su operación se habilitará después de que Paula cierre las decisiones críticas del MVP.</p></div>
    </div>
  );
}
