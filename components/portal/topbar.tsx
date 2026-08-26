import { LogOut } from "lucide-react";
import { initials, roleLabel } from "@/lib/portal";

export function Topbar({ email, name, role }: { email?: string | null; name?: string | null; role: string }) {
  return (
    <header className="topbar">
      <div className="topbar-meta">
        <span className="badge badge-info">Piloto privado</span>
        <span>Información aislada por organización</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="avatar">{initials(name, email)}</div>
        <div className="topbar-user">
          <strong>{name || email || "Usuario"}</strong>
          <span>{roleLabel(role)}</span>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn btn-ghost" type="submit" aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
