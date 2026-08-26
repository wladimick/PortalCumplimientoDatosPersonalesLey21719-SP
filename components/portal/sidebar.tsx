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

const baseItems = [
  { key: "dashboard", label: "Inicio", icon: BarChart3 },
  { key: "cumplimiento", label: "Cumplimiento", icon: ClipboardCheck },
  { key: "seguridad", label: "Seguridad", icon: LockKeyhole },
  { key: "acciones", label: "Acciones", icon: ListTodo },
  { key: "evidencias", label: "Evidencias", icon: FolderOpen },
  { key: "reportes", label: "Reportes", icon: FileCheck2 },
];

export function Sidebar({ orgSlug, orgName, internal, showAdministration }: { orgSlug: string; orgName: string; internal: boolean; showAdministration: boolean }) {
  const pathname = usePathname();
  const items = [
    ...baseItems,
    ...(internal && showAdministration ? [{ key: "administracion", label: "Administración", icon: UsersRound }] : []),
    ...(internal ? [{ key: "decisiones", label: "Decisiones Paula", icon: MessagesSquare }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><TiboxBrand light /></div>
      <div className="sidebar-client">
        <small>{internal ? "Espacio interno" : "Cliente"}</small>
        <strong>{orgName}</strong>
      </div>
      <nav className="nav" aria-label="Navegación principal">
        {items.map(({ key, label, icon: Icon }) => {
          const href = `/app/${orgSlug}/${key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={key} className={`nav-link${active ? " active" : ""}`} href={href}><Icon size={18} /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="nav-spacer" />
      <Link className="nav-link" href="/app"><Settings size={18} /><span>Cambiar organización</span></Link>
      <div className="sidebar-footer">TIBOX Compliance · MVP</div>
    </aside>
  );
}
