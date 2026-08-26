-- TIBOX Compliance — esquema inicial MVP
-- Ejecutar manualmente en Supabase > SQL Editor.
-- No contiene credenciales ni secretos.

begin;

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Identidad y organizaciones
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  rut text,
  status text not null default 'active' check (status in ('active','inactive')),
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('org_admin','compliance_manager','contributor','auditor','viewer')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ============================================================
-- 2. Cumplimiento
-- ============================================================

create table if not exists public.compliance_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_key text not null,
  name text not null,
  description text,
  legal_reference text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, module_key)
);

create table if not exists public.obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_id uuid not null references public.compliance_modules(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  legal_reference text,
  status text not null default 'pending' check (status in ('pending','in_progress','compliant','not_applicable')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  responsible_user_id uuid references public.profiles(id) on delete set null,
  due_date date,
  review_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

-- ============================================================
-- 3. Assessment de seguridad
-- ============================================================

create table if not exists public.security_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.security_controls (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid not null references public.security_categories(id) on delete cascade,
  code text not null,
  title text not null,
  description text,
  level text not null default 'basic' check (level in ('basic','intermediate','advanced','critical')),
  status text not null default 'pending' check (status in ('pending','in_progress','compliant','not_applicable')),
  recommendation text,
  responsible_user_id uuid references public.profiles(id) on delete set null,
  review_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

-- ============================================================
-- 4. Acciones, evidencia y auditoría
-- ============================================================

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  source_type text,
  source_id uuid,
  status text not null default 'open' check (status in ('open','in_progress','done','blocked')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  obligation_id uuid references public.obligations(id) on delete set null,
  security_control_id uuid references public.security_controls(id) on delete set null,
  action_item_id uuid references public.action_items(id) on delete set null,
  provider text not null default 'supabase' check (provider in ('supabase','sharepoint')),
  bucket_name text,
  storage_path text,
  external_url text,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 5. Decisiones de producto para el piloto interno
-- ============================================================

create table if not exists public.product_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  category text not null,
  question text not null,
  recommendation text,
  status text not null default 'pending' check (status in ('pending','answered','decided')),
  answer text,
  answered_by uuid references public.profiles(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

-- ============================================================
-- 6. Triggers de perfil y updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();
  return new;
end;
$$;

-- Backfill de usuarios creados antes de instalar el esquema.
insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name')
from auth.users
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

-- updated_at triggers
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','organizations','organization_memberships','compliance_modules','obligations',
    'security_categories','security_controls','action_items','product_decisions'
  ]
  LOOP
    EXECUTE format('drop trigger if exists trg_%I_updated_at on public.%I', t, t);
    EXECUTE format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- 7. Helpers de autorización (SECURITY DEFINER)
-- ============================================================

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any(allowed_roles)
  );
$$;

create or replace function public.shares_active_org(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships mine
    join public.organization_memberships theirs
      on theirs.organization_id = mine.organization_id
     and theirs.status = 'active'
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and theirs.user_id = target_user
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.has_org_role(uuid, text[]) from public;
revoke all on function public.shares_active_org(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;
grant execute on function public.shares_active_org(uuid) to authenticated;

-- ============================================================
-- 8. Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.compliance_modules enable row level security;
alter table public.obligations enable row level security;
alter table public.security_categories enable row level security;
alter table public.security_controls enable row level security;
alter table public.action_items enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_events enable row level security;
alter table public.product_decisions enable row level security;

-- Profiles: lectura propia o de usuarios que comparten organización. Sin escritura directa en el MVP.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
using (id = auth.uid() or public.shares_active_org(id));

-- Organizaciones: solo organizaciones de las que el usuario es miembro.
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations for select to authenticated
using (public.is_org_member(id));

-- Membresías: cada usuario ve las propias; admins/encargados pueden ver la organización completa.
drop policy if exists memberships_select on public.organization_memberships;
create policy memberships_select on public.organization_memberships for select to authenticated
using (
  user_id = auth.uid()
  or public.has_org_role(organization_id, array['org_admin','compliance_manager'])
);

-- Catálogos y datos de cumplimiento.
drop policy if exists modules_select on public.compliance_modules;
create policy modules_select on public.compliance_modules for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists modules_write on public.compliance_modules;
create policy modules_write on public.compliance_modules for all to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

drop policy if exists obligations_select on public.obligations;
create policy obligations_select on public.obligations for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists obligations_insert on public.obligations;
create policy obligations_insert on public.obligations for insert to authenticated
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists obligations_update on public.obligations;
create policy obligations_update on public.obligations for update to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists obligations_delete on public.obligations;
create policy obligations_delete on public.obligations for delete to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

drop policy if exists security_categories_select on public.security_categories;
create policy security_categories_select on public.security_categories for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists security_categories_write on public.security_categories;
create policy security_categories_write on public.security_categories for all to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

drop policy if exists security_controls_select on public.security_controls;
create policy security_controls_select on public.security_controls for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists security_controls_insert on public.security_controls;
create policy security_controls_insert on public.security_controls for insert to authenticated
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists security_controls_update on public.security_controls;
create policy security_controls_update on public.security_controls for update to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists security_controls_delete on public.security_controls;
create policy security_controls_delete on public.security_controls for delete to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

-- Acciones.
drop policy if exists actions_select on public.action_items;
create policy actions_select on public.action_items for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists actions_insert on public.action_items;
create policy actions_insert on public.action_items for insert to authenticated
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists actions_update on public.action_items;
create policy actions_update on public.action_items for update to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor']));
drop policy if exists actions_delete on public.action_items;
create policy actions_delete on public.action_items for delete to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

-- Evidencias: solo metadatos en esta fase; el bucket se configurará al cerrar P07.
drop policy if exists evidence_select on public.evidence;
create policy evidence_select on public.evidence for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists evidence_insert on public.evidence;
create policy evidence_insert on public.evidence for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_org_role(organization_id, array['org_admin','compliance_manager','contributor'])
);
drop policy if exists evidence_delete on public.evidence;
create policy evidence_delete on public.evidence for delete to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

-- Auditoría: append-only para usuarios de aplicación.
drop policy if exists audit_select on public.audit_events;
create policy audit_select on public.audit_events for select to authenticated
using (organization_id is not null and public.is_org_member(organization_id));
drop policy if exists audit_insert on public.audit_events;
create policy audit_insert on public.audit_events for insert to authenticated
with check (
  actor_user_id = auth.uid()
  and organization_id is not null
  and public.is_org_member(organization_id)
);
-- No se crean políticas UPDATE ni DELETE para audit_events.

-- Decisiones internas: lectura para miembros; escritura solo admins/encargados.
drop policy if exists decisions_select on public.product_decisions;
create policy decisions_select on public.product_decisions for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists decisions_update on public.product_decisions;
create policy decisions_update on public.product_decisions for update to authenticated
using (public.has_org_role(organization_id, array['org_admin','compliance_manager']))
with check (public.has_org_role(organization_id, array['org_admin','compliance_manager']));

-- ============================================================
-- 9. Índices
-- ============================================================

create index if not exists idx_memberships_user on public.organization_memberships(user_id, status);
create index if not exists idx_memberships_org on public.organization_memberships(organization_id, status);
create index if not exists idx_modules_org on public.compliance_modules(organization_id, sort_order);
create index if not exists idx_obligations_org on public.obligations(organization_id, status, priority);
create index if not exists idx_controls_org on public.security_controls(organization_id, status, level);
create index if not exists idx_actions_org on public.action_items(organization_id, status, due_date);
create index if not exists idx_evidence_org on public.evidence(organization_id, created_at desc);
create index if not exists idx_audit_org on public.audit_events(organization_id, created_at desc);
create index if not exists idx_decisions_org on public.product_decisions(organization_id, code);

-- ============================================================
-- 10. Seed del piloto
-- ============================================================

insert into public.organizations (name, slug, is_internal)
values
  ('TIBOX', 'tibox', true),
  ('Cliente Demo', 'cliente-demo', false)
on conflict (slug) do update
set name = excluded.name,
    is_internal = excluded.is_internal,
    updated_at = now();

-- Acceso temporal para revisión: todos los usuarios existentes son admins del espacio TIBOX
-- y lectores del Cliente Demo. Antes del primer cliente real, reemplazar este bootstrap por invitaciones explícitas.
insert into public.organization_memberships (organization_id, user_id, role)
select o.id, u.id, 'org_admin'
from public.organizations o
cross join auth.users u
where o.slug = 'tibox'
on conflict (organization_id, user_id) do update set role = excluded.role, status = 'active';

insert into public.organization_memberships (organization_id, user_id, role)
select o.id, u.id, 'viewer'
from public.organizations o
cross join auth.users u
where o.slug = 'cliente-demo'
on conflict (organization_id, user_id) do nothing;

-- Nueve módulos base para ambos espacios del piloto.
with module_seed(module_key, name, description, legal_reference, sort_order) as (
  values
    ('informacion_transparencia','Información y transparencia','Inventario, finalidades, bases legales, destinatarios, conservación y política de tratamiento.','Arts. 14 y 14 ter',10),
    ('derechos_titulares','Derechos de titulares','Procedimientos y evidencias para gestionar acceso, rectificación, supresión, oposición y portabilidad.','Arts. 4 a 11',20),
    ('seguridad_confidencialidad','Seguridad y confidencialidad','Controles técnicos y organizativos para proteger los datos personales.','Arts. 14 bis y 14 quinquies',30),
    ('incidentes','Incidentes y vulneraciones','Registro, procedimiento, evaluación y evidencias de gestión de incidentes.','Art. 14 sexies',40),
    ('privacidad_diseno','Privacidad desde el diseño','Controles de privacidad aplicados a nuevos proyectos, procesos y tratamientos.','Art. 14 quáter',50),
    ('terceros_encargados','Terceros y encargados','Contratos, anexos, registro y evaluación de proveedores que tratan datos personales.','Art. 15 bis',60),
    ('evaluaciones_impacto','Evaluaciones de impacto','Evaluaciones de alto riesgo, criterios y medidas de mitigación.','Art. 15 ter',70),
    ('prevencion_cumplimiento','Prevención y cumplimiento','Programa de cumplimiento, formación, controles y seguimiento.','Arts. 48 y 49',80),
    ('seguridad_infraestructura','Seguridad de infraestructura y aplicaciones','Assessment técnico para servidores, endpoints, Microsoft 365, red, SaaS y aplicaciones críticas.','Assessment técnico',90)
)
insert into public.compliance_modules (organization_id, module_key, name, description, legal_reference, sort_order)
select o.id, s.module_key, s.name, s.description, s.legal_reference, s.sort_order
from public.organizations o
cross join module_seed s
where o.slug in ('tibox','cliente-demo')
on conflict (organization_id, module_key) do update
set name = excluded.name, description = excluded.description, legal_reference = excluded.legal_reference, sort_order = excluded.sort_order;

-- 24 obligaciones demostrativas. La fórmula de score es provisoria hasta cerrar P11.
with obligation_seed(module_key, code, title, description, legal_reference, status, priority, due_days) as (
  values
    ('informacion_transparencia','INF-01','Inventario de tratamientos','Mantener un inventario actualizado de tratamientos y responsables.','Art. 14','compliant','high',null),
    ('informacion_transparencia','INF-02','Finalidades y bases legales','Documentar finalidad y base de legitimación de cada tratamiento.','Art. 14','compliant','high',null),
    ('informacion_transparencia','INF-03','Política de privacidad','Mantener información de privacidad clara, vigente y accesible.','Art. 14 ter','in_progress','high',20),
    ('informacion_transparencia','INF-04','Destinatarios y transferencias','Registrar destinatarios, cesiones y transferencias aplicables.','Art. 14','compliant','medium',null),
    ('derechos_titulares','DER-01','Procedimiento de derechos','Definir canal, responsables y flujo para solicitudes de titulares.','Arts. 4 a 11','compliant','high',null),
    ('derechos_titulares','DER-02','Validación de identidad','Verificar identidad antes de entregar o modificar información personal.','Arts. 4 a 11','compliant','high',null),
    ('derechos_titulares','DER-03','Control de plazos','Registrar fechas de ingreso, respuesta y cierre.','Arts. 4 a 11','in_progress','medium',12),
    ('derechos_titulares','DER-04','Portabilidad','Preparar procedimiento para entrega estructurada cuando corresponda.','Art. 11','pending','medium',35),
    ('seguridad_confidencialidad','SEG-01','Control de acceso','Aplicar mínimo privilegio y revisión periódica de permisos.','Art. 14 bis','compliant','critical',null),
    ('seguridad_confidencialidad','SEG-02','Confidencialidad y cifrado','Aplicar medidas de confidencialidad y cifrado según riesgo.','Art. 14 bis','compliant','high',null),
    ('seguridad_confidencialidad','SEG-03','Respaldo y recuperación','Mantener respaldos y pruebas periódicas de recuperación.','Art. 14 bis','compliant','high',null),
    ('seguridad_confidencialidad','SEG-04','Retención y eliminación','Definir conservación y eliminación segura por tipo de dato.','Art. 14 quinquies','in_progress','high',28),
    ('incidentes','INC-01','Procedimiento de incidentes','Definir detección, escalamiento, contención y recuperación.','Art. 14 sexies','compliant','critical',null),
    ('incidentes','INC-02','Registro de incidentes','Mantener bitácora de incidentes, impacto y acciones.','Art. 14 sexies','compliant','high',null),
    ('incidentes','INC-03','Flujo de notificación','Definir criterios, responsables y evidencias de notificación.','Art. 14 sexies','pending','critical',18),
    ('privacidad_diseno','PRI-01','Checklist de privacidad por diseño','Incorporar controles de privacidad en proyectos y cambios.','Art. 14 quáter','compliant','medium',null),
    ('privacidad_diseno','PRI-02','Revisión de cambios','Evaluar cambios relevantes antes de producción.','Art. 14 quáter','compliant','medium',null),
    ('terceros_encargados','TER-01','Registro de encargados','Mantener inventario de proveedores que tratan datos.','Art. 15 bis','compliant','high',null),
    ('terceros_encargados','TER-02','Cláusulas contractuales','Verificar obligaciones de protección de datos en contratos.','Art. 15 bis','compliant','high',null),
    ('terceros_encargados','TER-03','Revisión periódica de proveedores','Reevaluar riesgo y cumplimiento de terceros críticos.','Art. 15 bis','pending','high',45),
    ('evaluaciones_impacto','EIP-01','Criterios de evaluación de impacto','Definir cuándo un tratamiento requiere EIPD.','Art. 15 ter','compliant','high',null),
    ('evaluaciones_impacto','EIP-02','Registro de evaluaciones','Mantener evaluación, mitigaciones y aprobación.','Art. 15 ter','in_progress','high',30),
    ('prevencion_cumplimiento','PRE-01','Programa de cumplimiento','Formalizar responsables, controles y seguimiento del programa.','Arts. 48 y 49','compliant','high',null),
    ('prevencion_cumplimiento','PRE-02','Formación y monitoreo','Ejecutar formación periódica y mantener evidencia de seguimiento.','Arts. 48 y 49','pending','medium',50)
)
insert into public.obligations (organization_id, module_id, code, title, description, legal_reference, status, priority, due_date)
select o.id, m.id, s.code, s.title, s.description, s.legal_reference, s.status, s.priority,
       case when s.due_days is null then null else (current_date + s.due_days::int) end
from public.organizations o
join public.compliance_modules m on m.organization_id = o.id
join obligation_seed s on s.module_key = m.module_key
where o.slug in ('tibox','cliente-demo')
on conflict (organization_id, code) do update
set title = excluded.title, description = excluded.description, legal_reference = excluded.legal_reference,
    status = excluded.status, priority = excluded.priority, due_date = excluded.due_date, module_id = excluded.module_id;

-- Categorías técnicas.
with category_seed(name, slug, sort_order) as (
  values
    ('Servidores','servidores',10),
    ('PCs / Endpoints','endpoints',20),
    ('Correo / Microsoft 365','microsoft-365',30),
    ('Firewall / Red','red',40),
    ('Backup / Continuidad','backup',50),
    ('Aplicaciones SaaS / Base','saas',60),
    ('Aplicaciones internas / ERP / CRM','aplicaciones-internas',70)
)
insert into public.security_categories (organization_id, name, slug, sort_order)
select o.id, s.name, s.slug, s.sort_order
from public.organizations o cross join category_seed s
where o.slug in ('tibox','cliente-demo')
on conflict (organization_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

with control_seed(category_slug, code, title, description, level, status, recommendation) as (
  values
    ('servidores','SRV-01','Actualizaciones del sistema','Verificar versiones soportadas y parches de seguridad.','advanced','in_progress','Mantener ciclo mensual de parchado y excepciones documentadas.'),
    ('servidores','SRV-02','Acceso administrativo','Revisar cuentas privilegiadas y accesos remotos.','advanced','compliant','Usar cuentas nominativas, MFA y mínimo privilegio.'),
    ('servidores','SRV-03','Registro y monitoreo','Centralizar eventos relevantes y alertas.','intermediate','pending','Definir retención y revisión de logs críticos.'),
    ('endpoints','END-01','Protección endpoint','Validar antimalware/EDR activo y actualizado.','advanced','compliant','Centralizar políticas y alertas de endpoints.'),
    ('endpoints','END-02','Cifrado de equipos','Verificar cifrado de discos corporativos.','intermediate','in_progress','Aplicar cifrado y custodia de claves.'),
    ('endpoints','END-03','Inventario de equipos','Mantener inventario y estado de dispositivos.','basic','compliant','Conciliar altas, bajas y equipos sin uso.'),
    ('microsoft-365','M365-01','MFA administradores','Exigir MFA a cuentas privilegiadas.','critical','pending','Aplicar MFA resistente a phishing cuando sea posible.'),
    ('microsoft-365','M365-02','Cuentas y roles','Revisar roles administrativos y cuentas obsoletas.','advanced','in_progress','Ejecutar revisión trimestral de privilegios.'),
    ('microsoft-365','M365-03','Acceso condicional','Aplicar controles de sesión y ubicación según riesgo.','advanced','pending','Definir políticas base por perfiles de riesgo.'),
    ('red','RED-01','Reglas de firewall','Revisar reglas, servicios expuestos y excepciones.','advanced','compliant','Documentar dueño y vigencia de cada excepción.'),
    ('red','RED-02','Segmentación','Separar servicios críticos y redes de usuarios.','advanced','in_progress','Priorizar activos con datos personales.'),
    ('red','RED-03','Acceso remoto','Controlar VPN y accesos de terceros.','intermediate','compliant','MFA y expiración para accesos temporales.'),
    ('backup','BKP-01','Cobertura de respaldos','Validar que información crítica esté respaldada.','advanced','compliant','Documentar RPO por servicio.'),
    ('backup','BKP-02','Pruebas de recuperación','Probar restauración de datos y servicios.','advanced','pending','Registrar resultados y acciones correctivas.'),
    ('backup','BKP-03','Copia aislada','Mantener al menos una copia separada del entorno principal.','advanced','in_progress','Evaluar inmutabilidad para activos críticos.'),
    ('saas','SAA-01','SSO y MFA','Revisar autenticación de aplicaciones SaaS relevantes.','intermediate','compliant','Priorizar SSO corporativo y MFA.'),
    ('saas','SAA-02','Altas y bajas','Asegurar retiro oportuno de accesos.','basic','in_progress','Integrar bajas con proceso de RRHH/TI.'),
    ('saas','SAA-03','Datos y proveedores','Conocer ubicación, subprocessors y controles del proveedor.','intermediate','pending','Mantener ficha de riesgo de cada SaaS crítico.'),
    ('aplicaciones-internas','APP-01','Usuarios y roles','Verificar cuentas individuales y permisos por función.','basic','pending','Revisar roles y accesos con dueño de proceso.'),
    ('aplicaciones-internas','APP-02','Contraseñas y autenticación','Revisar política de autenticación y habilitar MFA cuando exista.','basic','pending','Migrar a SSO/MFA en aplicaciones compatibles.'),
    ('aplicaciones-internas','APP-03','Backups y cambios','Validar respaldo de datos y gestión de versiones/cambios.','intermediate','in_progress','Probar recuperación y documentar despliegues.')
)
insert into public.security_controls (organization_id, category_id, code, title, description, level, status, recommendation, review_date)
select o.id, c.id, s.code, s.title, s.description, s.level, s.status, s.recommendation, current_date + 30
from public.organizations o
join public.security_categories c on c.organization_id = o.id
join control_seed s on s.category_slug = c.slug
where o.slug in ('tibox','cliente-demo')
on conflict (organization_id, code) do update
set category_id = excluded.category_id, title = excluded.title, description = excluded.description,
    level = excluded.level, status = excluded.status, recommendation = excluded.recommendation, review_date = excluded.review_date;

-- Acciones demostrativas.
with action_seed(title, description, source_type, status, priority, due_days) as (
  values
    ('Cerrar procedimiento de derechos','Validar responsables, plazos y plantilla de respuesta.','obligation','in_progress','high',12),
    ('Definir flujo de notificación de incidentes','Acordar responsables y evidencias requeridas.','obligation','open','critical',18),
    ('Aplicar MFA a administradores M365','Revisar cuentas privilegiadas y política de autenticación.','security_control','open','critical',10),
    ('Ejecutar prueba de recuperación','Registrar prueba y tiempos reales de recuperación.','security_control','open','high',25)
)
insert into public.action_items (organization_id, title, description, source_type, status, priority, due_date)
select o.id, s.title, s.description, s.source_type, s.status, s.priority, current_date + s.due_days::int
from public.organizations o cross join action_seed s
where o.slug in ('tibox','cliente-demo')
  and not exists (
    select 1 from public.action_items a where a.organization_id = o.id and a.title = s.title
  );

-- 23 decisiones de producto del documento DECISIONES-PAULA.md.
with decision_seed(code, priority, category, question, recommendation) as (
  values
    ('P01','high','Marca','¿Cómo se llamará el producto frente a clientes?','Usar provisionalmente TIBOX Compliance y mantener el nombre configurable.'),
    ('P02','high','Dominio','¿Se aprueba cumplimiento.tibox.cl como dominio productivo?','Sí; es claro, corporativo y no amarra el producto a una sola ley.'),
    ('P03','critical','Producto','¿El producto nace solo para Ley 21.719 o con arquitectura para múltiples marcos?','Ley 21.719 primero, con arquitectura multi-framework.'),
    ('P04','critical','Clientes','¿Atenderemos solo clientes con Microsoft 365 o cualquier cliente TIBOX?','Cualquier cliente; Microsoft 365 debe ser una integración opcional.'),
    ('P05','critical','Autenticación','¿Qué métodos de acceso debe ofrecer el producto?','Microsoft prioritario más una alternativa segura para clientes sin M365.'),
    ('P06','high','Seguridad','¿MFA será obligatorio para administradores y/o todos los usuarios?','Obligatorio para roles TIBOX privilegiados y org_admin; evaluar el resto según identidad.'),
    ('P07','critical','Evidencias','¿Dónde se guardarán las evidencias: Supabase, SharePoint o configurable por cliente?','Configurable por cliente; para el MVP elegir un proveedor inicial sin acoplar la aplicación.'),
    ('P08','critical','Acceso TIBOX','¿Qué nivel de acceso tendrá TIBOX a la información de cada cliente?','Acceso temporal con motivo/ticket y auditoría como mínimo; aprobación del cliente cuando corresponda.'),
    ('P09','high','Roles','¿Los roles propuestos del cliente son suficientes y necesitamos un rol de consultor externo?','Validar Administrador, Encargado, Responsable, Auditor y Solo lectura antes de ampliar.'),
    ('P10','medium','Branding','¿La plataforma será 100% TIBOX, co-branding o white-label?','TIBOX + logo/nombre del cliente.'),
    ('P11','critical','Score','¿Cómo se calculará y versionará el porcentaje global de cumplimiento?','No inventar fórmula desde desarrollo; Compliance/negocio debe aprobar pesos, no aplica, parciales y criticidad.'),
    ('P12','critical','Contenido legal','¿Quién será dueño del catálogo maestro de Ley 21.719 y sus actualizaciones?','Asignar responsable funcional y versionar el catálogo.'),
    ('P13','medium','Auditoría','¿Qué parte de la auditoría verá el cliente?','Mostrar auditoría de negocio relevante y reservar detalles técnicos internos.'),
    ('P14','high','Retención','¿Qué plazos aplicarán a evidencias, auditoría, cuentas, ex-clientes, backups y exports?','Acordar política contractual/legal antes de automatizar borrados.'),
    ('P15','high','Offboarding','¿Qué recibe un cliente al finalizar el contrato?','Datos estructurados + reporte final + evidencias/referencias + constancia de cierre según contrato.'),
    ('P16','medium','Notificaciones','¿Qué notificaciones deben formar parte del MVP?','Invitación, asignación y vencimiento; evitar exceso inicial.'),
    ('P17','high','Reportes','¿Qué entregables espera el cliente: dashboard, PDF, Excel, informe técnico y/o reporte periódico?','Definir el mínimo comercial antes de construir generación automática.'),
    ('P18','critical','Comercial','¿Se venderá como SaaS, servicio administrado, consultoría o combinación?','Cerrar modelo comercial porque afecta límites, soporte, acceso, almacenamiento, SLA y planes.'),
    ('P19','high','Operación','¿Qué SLA, horario, canal y tiempos de respuesta se ofrecerán?','Definir con Operaciones antes de comprometer disponibilidad/RTO/RPO.'),
    ('P20','critical','Residencia de datos','¿Existe requisito de región específica para base de datos, archivos y backups?','Confirmar antes de producción; cambiar región después puede requerir migración.'),
    ('P21','medium','IA','¿IA forma parte del roadmap comercial?','Fuera del MVP y sin enviar evidencia sensible hasta contar con política aprobada.'),
    ('P22','medium','WebOps','¿TIBOX Compliance debe consumir señales técnicas de WebOps más adelante?','Sí como roadmap, vía API y sin acoplar bases de datos.'),
    ('P23','medium','Repositorio','¿Renombramos el repositorio a Tibox-Compliance una vez aprobado el foco?','Sí antes de consolidar producción para eliminar referencias a SharePoint y una ley específica.')
)
insert into public.product_decisions (organization_id, code, priority, category, question, recommendation)
select o.id, d.code, d.priority, d.category, d.question, d.recommendation
from public.organizations o cross join decision_seed d
where o.slug = 'tibox'
on conflict (organization_id, code) do update
set priority = excluded.priority, category = excluded.category, question = excluded.question, recommendation = excluded.recommendation;

commit;
