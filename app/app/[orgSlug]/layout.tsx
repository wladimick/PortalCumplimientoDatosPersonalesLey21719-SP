import { Sidebar } from "@/components/portal/sidebar";
import { Topbar } from "@/components/portal/topbar";
import { getOrganizationContext } from "@/lib/portal";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { user, organization, membership } = await getOrganizationContext(orgSlug);
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || null;

  return (
    <div className="portal-shell">
      <Sidebar orgSlug={orgSlug} orgName={organization.name} internal={organization.is_internal} />
      <main className="portal-main">
        <Topbar email={user.email} name={displayName} role={membership.role} />
        {children}
      </main>
    </div>
  );
}
