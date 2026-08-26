import { PortalShell } from "@/components/portal/portal-shell";
import { displayNameForUser, getOrganizationContext, getPlatformRole } from "@/lib/portal";

export default async function OrganizationLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgSlug: string }>; }) {
  const { orgSlug } = await params;
  const [{ user, organization, membership }, platformRole] = await Promise.all([getOrganizationContext(orgSlug), getPlatformRole()]);
  return (
    <PortalShell orgSlug={orgSlug} orgName={organization.name} internal={organization.is_internal} email={user.email} name={displayNameForUser(user)} role={membership.role} platformRole={platformRole}>
      {children}
    </PortalShell>
  );
}
