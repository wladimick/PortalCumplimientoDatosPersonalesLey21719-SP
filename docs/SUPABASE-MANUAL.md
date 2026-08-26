# Supabase — instalación manual del MVP

Este procedimiento se usa mientras el proyecto Supabase de **TIBOX Compliance** no está conectado a ChatGPT/MCP. La base se administra manualmente desde el Dashboard de Supabase y la fuente de verdad del esquema queda versionada en GitHub.

## Migraciones a ejecutar

Ejecutar los archivos **en este orden**:

```text
supabase/migrations/20260826120000_initial_mvp.sql
supabase/migrations/20260826130000_import_paula_sharepoint_catalog.sql
supabase/migrations/20260826173000_access_governance_and_client_deletion.sql
supabase/migrations/20260826203000_superadmin_client_provisioning.sql
```

Cada archivo se ejecuta desde:

```text
Supabase Dashboard
→ TIBOX Compliance
→ SQL Editor
→ New query
→ pegar SQL
→ Run
```

No editar una migración que ya haya sido aplicada. Si el ambiente ya tiene las primeras migraciones, ejecutar solamente las nuevas pendientes.

## Qué crea la instalación

- `profiles`
- `organizations`
- `organization_memberships`
- `compliance_modules`
- `obligations`
- `security_categories`
- `security_controls`
- `action_items`
- `evidence`
- `audit_events`
- `product_decisions`
- `platform_user_roles`
- `organization_access_grants`
- `platform_audit_events`
- helpers de autorización
- Row Level Security
- índices
- triggers de identidad y `updated_at`
- catálogo funcional de `cliente-demo`
- gobierno de acceso y offboarding
- provisioning transaccional de nuevos clientes

## Espacios base

La instalación mantiene:

1. `TIBOX`: organización interna de gobierno y decisiones;
2. `Cliente Demo`: tenant de demostración y fuente actual de la plantilla funcional.

El catálogo importado desde el trabajo de Paula queda asociado a `cliente-demo`. El provisioning de nuevos clientes copia únicamente la estructura funcional necesaria y reinicia estados operativos.

## Roles de plataforma del piloto

Después de aplicar `20260826203000_superadmin_client_provisioning.sql`:

```text
wdiaz@tibox.cl   → platform_admin
pfarias@tibox.cl → platform_admin
```

Ambos pueden entrar a:

```text
/app/tibox/administracion
```

para crear clientes, asignar accesos y realizar operaciones reservadas de plataforma.

## Alta de nuevos clientes

No es necesario crear filas manualmente en `organizations`.

Desde **TIBOX → Administración → Nuevo cliente**, un `platform_admin` puede indicar:

- nombre;
- RUT;
- slug opcional;
- correo del administrador inicial;
- rol inicial.

La aplicación llama a:

```text
public.create_customer_org(...)
```

La función valida nuevamente el rol global del actor y crea, dentro de una misma transacción:

- organización;
- módulos;
- obligaciones;
- categorías de seguridad;
- controles técnicos;
- grant inicial por correo;
- evento de auditoría.

Si la plantilla está incompleta o falla cualquier paso, el alta se revierte completa.

Guía funcional: [`ALTA-CLIENTES.md`](ALTA-CLIENTES.md).

## Seguridad

El frontend utiliza únicamente:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

La contraseña de base de datos **no se utiliza en el frontend ni debe agregarse a Vercel/GitHub**.

`SUPABASE_SERVICE_ROLE_KEY` nunca debe exponerse al navegador. Se reserva para operaciones administrativas de servidor que la necesitan, actualmente la limpieza de usuarios Auth huérfanos después de la eliminación completa de un cliente.

La función de alta es `SECURITY DEFINER`, pero:

- valida `auth.uid()`;
- exige `platform_admin` dentro de PostgreSQL;
- usa `search_path` vacío y nombres de esquema explícitos;
- revoca ejecución pública;
- concede `EXECUTE` únicamente a `authenticated`.

RLS continúa siendo la barrera normal de acceso a datos de cada organización.

## Verificación después de las migraciones

1. abrir **Table Editor**;
2. comprobar que existen `TIBOX` y `Cliente Demo` en `organizations`;
3. comprobar que `platform_user_roles` tiene a Wladimick y Paula como `platform_admin`;
4. comprobar que `cliente-demo` tiene módulos, obligaciones, categorías y controles;
5. iniciar sesión con Paula;
6. verificar que el menú **Administración** está disponible dentro de TIBOX;
7. crear un cliente QA desde la interfaz;
8. comprobar que el cliente recibió el catálogo con estados `pending`;
9. comprobar que no heredó evidencias, acciones, responsables ni fechas;
10. comprobar que existe el grant del administrador inicial;
11. iniciar sesión con ese correo mediante magic link y validar que obtiene su organización.

## Usuarios nuevos

El alta de un cliente puede autorizar un correo aunque todavía no exista en Supabase Auth.

Cuando ese correo utiliza el magic link, el trigger de identidad:

1. crea o actualiza `profiles`;
2. busca `organization_access_grants` activos para el correo;
3. crea o reactiva las `organization_memberships` correspondientes.

Autenticarse sin un grant activo no entrega acceso a datos de clientes.

## Cambios posteriores

Toda evolución de esquema se agrega como una nueva migración dentro de:

```text
supabase/migrations/
```

Nunca modificar migraciones ya ejecutadas en producción.
