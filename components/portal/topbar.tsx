import { LogOut } from "lucide-react";
import { GlobalSearch } from "@/components/portal/global-search";
import { AccessibilityControls } from "@/components/portal/accessibility-controls";

const roleLabels: Record<string, string> = {
  platform_admin: "Administrador TIBOX",
  platform_support: "Soporte TIBOX",
  org_admin: "Administrador",
  compliance_manager: "Encargado de cumplimiento",
  contributor: "Responsable",
  auditor: "Auditor",
  viewer: "Solo lectura",
};

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "TC").trim();
  const pieces = source.split(/\s+|@/).filter(Boolean);
  return pieces.slice(0, 2).map((piece) => piece[0]?.toUpperCase()).join("") || "TC";
}

export function Topbar({ orgSlug, email, name, role }: { orgSlug: string; email?: string | null; name?: string | null; role: string }) {
  return (
    <header className="topbar">
      <GlobalSearch orgSlug={orgSlug} />
      <div className="topbar-actions">
        <AccessibilityControls />
        <div className="user-identity">
          <div className="avatar">{getInitials(name, email)}</div>
          <div className="topbar-user">
            <strong>{name || email || "Usuario"}</strong>
            <span>{roleLabels[role] ?? role}</span>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="icon-btn" type="submit" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button>
        </form>
      </div>
    </header>
  );
}
