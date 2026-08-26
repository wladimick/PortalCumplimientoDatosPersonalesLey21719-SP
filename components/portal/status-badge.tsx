const labels: Record<string, string> = {
  compliant: "Cumplido",
  in_progress: "En proceso",
  pending: "Pendiente",
  not_applicable: "No aplica",
  open: "Abierta",
  done: "Completada",
  blocked: "Bloqueada",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
  answered: "Respondida",
  decided: "Cerrada",
};

function tone(value: string) {
  if (["compliant", "done", "decided"].includes(value)) return "badge-success";
  if (["pending", "medium", "basic"].includes(value)) return "badge-warning";
  if (["high", "critical", "blocked"].includes(value)) return "badge-danger";
  if (["in_progress", "intermediate", "answered"].includes(value)) return "badge-info";
  return "badge-neutral";
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge ${tone(value)}`}>{labels[value] ?? value}</span>;
}
