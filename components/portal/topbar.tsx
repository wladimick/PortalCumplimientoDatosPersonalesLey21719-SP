import { LogOut } from "lucide-react";
import { initials, roleLabel } from "@/lib/portal";
import { GlobalSearch } from "@/components/portal/global-search";
import { AccessibilityControls } from "@/components/portal/accessibility-controls";

export function Topbar({ orgSlug, email, name, role }: { orgSlug: string; email?: string | null; name?: string | null; role: string }) {
  return (
    <header className="topbar">
      <GlobalSearch orgSlug={orgSlug} />
      <div className="topbar-actions">
        <AccessibilityControls />
        <div className="user-identity">
          <div className="avatar">{initials(name, email)}</div>
          <div className="topbar-user">
            <strong>{name || email || "Usuario"}</strong>
            <span>{roleLabel(role)}</span>
          </div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="icon-btn" type="submit" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18} /></button>
        </form>
      </div>
    </header>
  );
}
