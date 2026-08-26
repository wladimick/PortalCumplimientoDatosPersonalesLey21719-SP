-- TIBOX Compliance — alta transaccional de clientes desde Super Admin
-- Fecha: 2026-08-26
-- Ejecutar DESPUÉS de 20260826173000_access_governance_and_client_deletion.sql.
-- No editar migraciones ya ejecutadas; toda evolución se agrega como una migración nueva.

begin;

-- Paula queda con las mismas facultades globales de administración que Wladimick.
insert into public.platform_user_roles (user_id, role, status)
select id, 'platform_admin', 'active'
from public.profiles
where lower(email) = 'pfarias@tibox.cl'
on conflict (user_id) do update
set role = excluded.role,
    status = 'active',
    updated_at = now();

-- Crea un cliente, copia la plantilla funcional desde cliente-demo y deja
-- autorizado al administrador inicial. Todo ocurre en una única transacción.
create or replace function public.create_customer_org(
  customer_name text,
  customer_slug text,
  customer_rut text,
  initial_admin_email text,
  initial_admin_role text default 'org_admin'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  template_org_id uuid;
  new_org_id uuid;
  normalized_name text := trim(customer_name);
  normalized_slug text := lower(trim(customer_slug));
  normalized_rut text := nullif(trim(customer_rut), '');
  normalized_email text := lower(trim(initial_admin_email));
  module_count integer := 0;
  obligation_count integer := 0;
  category_count integer := 0;
  control_count integer := 0;
begin
  if actor_id is null or not public.has_platform_role(array['platform_admin']) then
    raise exception 'Solo un Administrador TIBOX puede crear clientes';
  end if;

  if normalized_name is null or length(normalized_name) < 2 or length(normalized_name) > 120 then
    raise exception 'El nombre del cliente debe tener entre 2 y 120 caracteres';
  end if;

  if normalized_slug is null
     or length(normalized_slug) < 2
     or length(normalized_slug) > 80
     or normalized_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'El slug solo puede contener minúsculas, números y guiones simples';
  end if;

  if normalized_rut is not null and length(normalized_rut) > 32 then
    raise exception 'El RUT ingresado es demasiado largo';
  end if;

  if normalized_email is null
     or length(normalized_email) > 254
     or normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'El correo del administrador inicial no es válido';
  end if;

  if initial_admin_role not in ('org_admin','compliance_manager','contributor','auditor','viewer') then
    raise exception 'El rol inicial no es válido';
  end if;

  if normalized_slug in ('tibox', 'cliente-demo') then
    raise exception 'El slug indicado está reservado por la plataforma';
  end if;

  select o.id
  into template_org_id
  from public.organizations o
  where o.slug = 'cliente-demo'
    and o.status = 'active'
  limit 1;

  if template_org_id is null then
    raise exception 'No existe la plantilla cliente-demo requerida para crear clientes';
  end if;

  insert into public.organizations (name, slug, rut, status, is_internal)
  values (normalized_name, normalized_slug, normalized_rut, 'active', false)
  returning id into new_org_id;

  insert into public.compliance_modules (
    organization_id, module_key, name, description, legal_reference, sort_order
  )
  select
    new_org_id, source.module_key, source.name, source.description, source.legal_reference, source.sort_order
  from public.compliance_modules source
  where source.organization_id = template_org_id;
  get diagnostics module_count = row_count;

  insert into public.obligations (
    organization_id,
    module_id,
    code,
    title,
    description,
    legal_reference,
    status,
    priority,
    responsible_user_id,
    due_date,
    review_date,
    notes
  )
  select
    new_org_id,
    target_module.id,
    source_obligation.code,
    source_obligation.title,
    source_obligation.description,
    source_obligation.legal_reference,
    'pending',
    source_obligation.priority,
    null,
    null,
    null,
    null
  from public.obligations source_obligation
  join public.compliance_modules source_module
    on source_module.id = source_obligation.module_id
   and source_module.organization_id = template_org_id
  join public.compliance_modules target_module
    on target_module.organization_id = new_org_id
   and target_module.module_key = source_module.module_key
  where source_obligation.organization_id = template_org_id;
  get diagnostics obligation_count = row_count;

  insert into public.security_categories (
    organization_id, name, slug, sort_order
  )
  select
    new_org_id, source.name, source.slug, source.sort_order
  from public.security_categories source
  where source.organization_id = template_org_id;
  get diagnostics category_count = row_count;

  insert into public.security_controls (
    organization_id,
    category_id,
    code,
    title,
    description,
    level,
    status,
    recommendation,
    responsible_user_id,
    review_date,
    notes
  )
  select
    new_org_id,
    target_category.id,
    source_control.code,
    source_control.title,
    source_control.description,
    source_control.level,
    'pending',
    source_control.recommendation,
    null,
    null,
    null
  from public.security_controls source_control
  join public.security_categories source_category
    on source_category.id = source_control.category_id
   and source_category.organization_id = template_org_id
  join public.security_categories target_category
    on target_category.organization_id = new_org_id
   and target_category.slug = source_category.slug
  where source_control.organization_id = template_org_id;
  get diagnostics control_count = row_count;

  insert into public.organization_access_grants (
    organization_id, email, role, status, created_by
  )
  values (
    new_org_id, normalized_email, initial_admin_role, 'active', actor_id
  );

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    new_org_id,
    actor_id,
    'organization.created',
    'organization',
    new_org_id,
    jsonb_build_object(
      'template', 'cliente-demo',
      'initial_admin_email', normalized_email,
      'initial_admin_role', initial_admin_role,
      'modules', module_count,
      'obligations', obligation_count,
      'security_categories', category_count,
      'security_controls', control_count
    )
  );

  return jsonb_build_object(
    'organization_id', new_org_id,
    'name', normalized_name,
    'slug', normalized_slug,
    'initial_admin_email', normalized_email,
    'initial_admin_role', initial_admin_role,
    'modules', module_count,
    'obligations', obligation_count,
    'security_categories', category_count,
    'security_controls', control_count
  );
exception
  when unique_violation then
    raise exception 'Ya existe un cliente con ese slug o un registro equivalente';
end;
$$;

revoke all on function public.create_customer_org(text, text, text, text, text) from public;
revoke all on function public.create_customer_org(text, text, text, text, text) from anon;
grant execute on function public.create_customer_org(text, text, text, text, text) to authenticated;

commit;
