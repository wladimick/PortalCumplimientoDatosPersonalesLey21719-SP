-- TIBOX Compliance — gobierno de acceso, roles de plataforma y baja de clientes
-- Fecha: 2026-08-26
-- Ejecutar DESPUÉS de 20260826120000_initial_mvp.sql y 20260826130000_import_paula_sharepoint_catalog.sql.
-- No editar migraciones ya ejecutadas; toda evolución debe usar una migración nueva.

begin;

create table if not exists public.platform_user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('platform_admin','platform_support')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_access_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('org_admin','compliance_manager','contributor','auditor','viewer')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.platform_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  former_organization_id uuid,
  reason_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_grants_email on public.organization_access_grants(lower(email), status);
create index if not exists idx_access_grants_org on public.organization_access_grants(organization_id, status);
create index if not exists idx_platform_audit_created on public.platform_audit_events(created_at desc);

drop trigger if exists trg_platform_user_roles_updated_at on public.platform_user_roles;
create trigger trg_platform_user_roles_updated_at before update on public.platform_user_roles for each row execute function public.set_updated_at();
drop trigger if exists trg_organization_access_grants_updated_at on public.organization_access_grants;
create trigger trg_organization_access_grants_updated_at before update on public.organization_access_grants for each row execute function public.set_updated_at();

create or replace function public.has_platform_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.platform_user_roles p
    where p.user_id = auth.uid() and p.status = 'active' and p.role = any(allowed_roles)
  );
$$;

create or replace function public.can_manage_org_access(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_platform_role(array['platform_admin','platform_support'])
    or public.has_org_role(target_org, array['org_admin']);
$$;

revoke all on function public.has_platform_role(text[]) from public;
revoke all on function public.can_manage_org_access(uuid) from public;
grant execute on function public.has_platform_role(text[]) to authenticated;
grant execute on function public.can_manage_org_access(uuid) to authenticated;

alter table public.platform_user_roles enable row level security;
alter table public.organization_access_grants enable row level security;
alter table public.platform_audit_events enable row level security;

drop policy if exists platform_roles_select on public.platform_user_roles;
create policy platform_roles_select on public.platform_user_roles for select to authenticated
using (user_id = auth.uid() or public.has_platform_role(array['platform_admin']));

drop policy if exists platform_roles_write on public.platform_user_roles;
create policy platform_roles_write on public.platform_user_roles for all to authenticated
using (public.has_platform_role(array['platform_admin']))
with check (public.has_platform_role(array['platform_admin']));

drop policy if exists access_grants_select on public.organization_access_grants;
create policy access_grants_select on public.organization_access_grants for select to authenticated
using (public.can_manage_org_access(organization_id));

drop policy if exists access_grants_write on public.organization_access_grants;
create policy access_grants_write on public.organization_access_grants for all to authenticated
using (public.can_manage_org_access(organization_id))
with check (public.can_manage_org_access(organization_id));

drop policy if exists platform_audit_select on public.platform_audit_events;
create policy platform_audit_select on public.platform_audit_events for select to authenticated
using (public.has_platform_role(array['platform_admin','platform_support']));

-- Los administradores TIBOX pueden descubrir organizaciones para gestionarlas.
drop policy if exists organizations_platform_select on public.organizations;
create policy organizations_platform_select on public.organizations for select to authenticated
using (public.has_platform_role(array['platform_admin','platform_support']));

-- Permitir que auditoría de un cliente registre acciones de gobierno mientras el cliente existe.
drop policy if exists audit_insert on public.audit_events;
create policy audit_insert on public.audit_events for insert to authenticated
with check (
  actor_user_id = auth.uid()
  and organization_id is not null
  and (public.is_org_member(organization_id) or public.has_platform_role(array['platform_admin','platform_support']))
);

-- Nombres conocidos del piloto.
update public.profiles set full_name = 'Wladimick Diaz', updated_at = now() where lower(email) = 'wdiaz@tibox.cl';
update public.profiles set full_name = 'Paula Farías', updated_at = now() where lower(email) = 'pfarias@tibox.cl';

insert into public.platform_user_roles (user_id, role)
select id, 'platform_admin' from public.profiles where lower(email) = 'wdiaz@tibox.cl'
on conflict (user_id) do update set role = excluded.role, status = 'active';

insert into public.platform_user_roles (user_id, role)
select id, 'platform_support' from public.profiles where lower(email) = 'pfarias@tibox.cl'
on conflict (user_id) do update set role = excluded.role, status = 'active';

-- Convertir las membresías ya existentes en allowlist explícita.
insert into public.organization_access_grants (organization_id, email, role, status)
select m.organization_id, lower(p.email), m.role, m.status
from public.organization_memberships m
join public.profiles p on p.id = m.user_id
where p.email is not null
on conflict (organization_id, email) do update set role = excluded.role, status = excluded.status;

create or replace function public.sync_access_grant_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare target_user uuid;
begin
  new.email := lower(trim(new.email));
  select id into target_user from public.profiles where lower(email) = new.email limit 1;
  if target_user is not null then
    insert into public.organization_memberships (organization_id, user_id, role, status)
    values (new.organization_id, target_user, new.role, new.status)
    on conflict (organization_id, user_id) do update set role = excluded.role, status = excluded.status, updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_access_grant on public.organization_access_grants;
create trigger trg_sync_access_grant before insert or update of email, role, status on public.organization_access_grants
for each row execute function public.sync_access_grant_membership();

-- Autenticarse no entrega datos por sí mismo: cada cambio de identidad reconcilia membresías contra grants activos del correo actual.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();

  -- Si el correo Auth cambia, una membresía emitida para el correo anterior no puede seguir autorizando acceso.
  update public.organization_memberships m
  set status = 'inactive', updated_at = now()
  where m.user_id = new.id
    and not exists (
      select 1
      from public.organization_access_grants g
      where g.organization_id = m.organization_id
        and g.status = 'active'
        and lower(g.email) = lower(new.email)
    );

  -- Activar o actualizar exclusivamente membresías respaldadas por un grant vigente del correo actual.
  insert into public.organization_memberships (organization_id, user_id, role, status)
  select g.organization_id, new.id, g.role, 'active'
  from public.organization_access_grants g
  where g.status = 'active' and lower(g.email) = lower(new.email)
  on conflict (organization_id, user_id) do update
  set role = excluded.role, status = 'active', updated_at = now();

  return new;
end;
$$;

-- Baja irreversible de cliente. La función devuelve usuarios afectados para limpieza de Auth desde servidor.
create or replace function public.delete_customer_org(target_org uuid, confirmation_slug text, reason_code text)
returns uuid[] language plpgsql security definer set search_path = public as $$
declare
  org_record public.organizations%rowtype;
  affected uuid[];
begin
  if auth.uid() is null or not public.has_platform_role(array['platform_admin']) then
    raise exception 'Solo platform_admin puede eliminar clientes';
  end if;

  select * into org_record from public.organizations where id = target_org for update;
  if not found then raise exception 'Organización no encontrada'; end if;
  if org_record.is_internal then raise exception 'La organización interna TIBOX no puede eliminarse'; end if;
  if trim(confirmation_slug) <> org_record.slug then raise exception 'La confirmación no coincide con el slug'; end if;
  if reason_code not in ('contract_ended','customer_request','data_retention_expired','test_cleanup') then raise exception 'Motivo no permitido'; end if;

  select coalesce(array_agg(user_id), '{}'::uuid[]) into affected
  from public.organization_memberships where organization_id = target_org;

  -- audit_events usa ON DELETE SET NULL; borramos explícitamente para no conservar datos del cliente.
  delete from public.audit_events where organization_id = target_org;
  delete from public.organizations where id = target_org; -- CASCADE para datos dependientes.

  -- Auditoría mínima de plataforma: no conserva nombre, RUT, correo ni contenido del cliente.
  insert into public.platform_audit_events (actor_user_id, action, former_organization_id, reason_code, metadata)
  values (auth.uid(), 'client.deleted', target_org, reason_code, jsonb_build_object('schema_version', 1));

  return affected;
end;
$$;

revoke all on function public.delete_customer_org(uuid, text, text) from public;
grant execute on function public.delete_customer_org(uuid, text, text) to authenticated;

commit;
