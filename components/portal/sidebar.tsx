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

export function Sidebar({ orgSlug, orgName, internal }: { orgSlug: string; orgName: string; internal: boolean }) {
  const pathname = usePathname();
  const items = internal
    ? [...baseItems, { key: "decisiones", label: "Decisiones Paula", icon: MessagesSquare }]
    : baseItems;

  return (
    <aside className="sidebar">
      <div className="brand-strip" />
      <div className="sidebar-header"><TiboxBrand light /></div>
      <div className="sidebar-client">
        <small>{internal ? "Espacio interno" : "Cliente"}</small>
        <strong>{orgName}</strong>
      </div>

      <nav className="nav" aria-label="Navegación principal">
        {items.map(({ key, label, icon: Icon }) => {
          const href = `/app/${orgSlug}/${key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={key} className={`nav-link${active ? " active" : ""}`} href={href}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="nav-spacer" />
      <Link className="nav-link" href="/app">
        <Settings size={18} aria-hidden="true" />
        Cambiar organización
      </Link>
      <div className="sidebar-footer">MVP · Ley 21.719 · TIBOX</div>
    </aside>
  );
}
