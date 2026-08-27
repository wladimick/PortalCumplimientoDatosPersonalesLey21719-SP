"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  FolderOpen,
  ListTodo,
  LockKeyhole,
  MessagesSquare,
  Settings,
  UsersRound,
} from "lucide-react";
import { TiboxBrand } from "@/components/brand/tibox-brand";

type NavigationItem = {
  key: string;
  label: string;
  icon: typeof BarChart3;
};

type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

const dashboardItem: NavigationItem = { key: "dashboard", label: "Dashboard", icon: BarChart3 };

const managementItems: NavigationItem[] = [
  { key: "cumplimiento", label: "Cumplimiento", icon: ClipboardCheck },
  { key: "seguridad", label: "Seguridad", icon: LockKeyhole },
  { key: "acciones", label: "Acciones", icon: ListTodo },
  { key: "evidencias", label: "Evidencias", icon: FolderOpen },
  { key: "reportes", label: "Reportes", icon: FileCheck2 },
];

export function Sidebar({ orgSlug, orgName, internal, showAdministration }: { orgSlug: string; orgName: string; internal: boolean; showAdministration: boolean }) {
  const pathname = usePathname();

  const groups: NavigationGroup[] = [
    { label: "Inicio", items: [dashboardItem] },
    { label: "Gestión", items: managementItems },
    ...(internal && showAdministration
      ? [{ label: "Sistema", items: [{ key: "administracion", label: "Administración", icon: UsersRound }] }]
      : []),
    ...(internal
      ? [{ label: "Interno", items: [{ key: "decisiones", label: "Decisiones Paula", icon: MessagesSquare }] }]
      : []),
  ];

  return (
    <aside className="sidebar sidebar-hub">
      <div className="sidebar-brand sidebar-hub-brand"><TiboxBrand light /></div>

      <div className="sidebar-hub-context" title={orgName}>
        <span>{internal ? "Espacio interno" : "Cliente"}</span>
        <strong>{orgName}</strong>
      </div>

      <nav className="nav sidebar-hub-nav" aria-label="Navegación principal">
        {groups.map((group) => (
          <div className="sidebar-nav-group" key={group.label}>
            <span className="sidebar-nav-label">{group.label}</span>
            <div className="sidebar-nav-links">
              {group.items.map(({ key, label, icon: Icon }) => {
                const href = `/app/${orgSlug}/${key}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link key={key} className={`nav-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined}>
                    <Icon size={18} strokeWidth={1.9} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="nav-spacer" />
      <div className="sidebar-hub-bottom">
        <Link className="nav-link sidebar-switch-link" href="/app"><Settings size={18} strokeWidth={1.9} /><span>Cambiar organización</span></Link>
        <div className="sidebar-footer">TIBOX Compliance</div>
      </div>
    </aside>
  );
}
