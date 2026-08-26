const labels: Record<string, string> = {
  compliant: "Cumplido", in_progress: "En proceso", pending: "Pendiente", not_applicable: "No aplica",
  open: "Abierta", done: "Completada", blocked: "Bloqueada",
  low: "Baja", medium: "Media", high: "Alta", critical: "Crítica",
  basic: "Básico", intermediate: "Intermedio", advanced: "Avanzado",
  answered: "Respondida", decided: "Cerrada", active: "Activo", inactive: "Inactivo",
  org_admin: "Administrador", compliance_manager: "Encargado", contributor: "Responsable", auditor: "Auditor", viewer: "Solo lectura",
  platform_admin: "Administrador TIBOX", platform_support: "Soporte TIBOX",
};

export function statusLabel(value: string) { return labels[value] ?? value; }

function tone(value: string) {
  if (["compliant", "done", "decided", "active"].includes(value)) return "badge-success";
  if (["pending", "medium", "basic"].includes(value)) return "badge-warning";
  if (["high", "critical", "blocked"].includes(value)) return "badge-danger";
  if (["in_progress", "intermediate", "answered", "advanced"].includes(value)) return "badge-info";
  return "badge-neutral";
}

export function StatusBadge({ value }: { value: string }) { return <span className={`badge ${tone(value)}`}>{statusLabel(value)}</span>; }
