"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/portal/sidebar";
import { Topbar } from "@/components/portal/topbar";

export function PortalShell({
  children,
  orgSlug,
  orgName,
  internal,
  email,
  name,
  role,
  platformRole,
}: {
  children: React.ReactNode;
  orgSlug: string;
  orgName: string;
  internal: boolean;
  email?: string | null;
  name?: string | null;
  role: string;
  platformRole?: string | null;
}) {
  const pathname = usePathname();
  const executiveHome = !internal && pathname === `/app/${orgSlug}/dashboard`;

  if (executiveHome) return <div className="executive-root">{children}</div>;

  return (
    <div className="portal-shell">
      <Sidebar orgSlug={orgSlug} orgName={orgName} internal={internal} showAdministration={Boolean(platformRole)} />
      <main className="portal-main">
        <Topbar orgSlug={orgSlug} email={email} name={name} role={platformRole || role} />
        {children}
      </main>
    </div>
  );
}
