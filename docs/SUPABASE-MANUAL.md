# Supabase — instalación manual del MVP

Este procedimiento se usa mientras el proyecto Supabase de **TIBOX Compliance** no está conectado a ChatGPT/MCP. La base se administra manualmente desde el Dashboard de Supabase y la fuente de verdad del esquema queda versionada en GitHub.

## Archivo a ejecutar

Copiar **todo** el contenido de:

```text
supabase/migrations/20260826120000_initial_mvp.sql
```

y ejecutarlo en:

```text
Supabase Dashboard
→ TIBOX Compliance
→ SQL Editor
→ New query
→ pegar SQL
→ Run
```

El script está pensado para una instalación inicial y utiliza `ON CONFLICT` para que el seed principal sea tolerante a re-ejecuciones.

## Qué crea

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
- helpers de autorización
- Row Level Security
- índices
- triggers de perfil y `updated_at`
- datos demostrativos
- 23 decisiones del documento `DECISIONES-PAULA.md`

## Bootstrap temporal del piloto

Para que los usuarios que ya existen en Supabase Auth puedan entrar inmediatamente:

1. se crean perfiles para todos los usuarios existentes;
2. se crea la organización interna `TIBOX`;
3. se crea `Cliente Demo`;
4. los usuarios Auth existentes quedan como `org_admin` en `TIBOX`;
5. esos mismos usuarios quedan como `viewer` en `Cliente Demo`.

**Esto es deliberadamente temporal.** Antes de incorporar al primer cliente real se reemplazará por un flujo explícito de invitaciones y asignación de roles.

## Seguridad

El frontend utiliza únicamente:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

La contraseña de base de datos **no se utiliza en el frontend ni debe agregarse a Vercel/GitHub**.

La `service_role` tampoco es necesaria para este MVP. Se añadirá solo cuando exista una operación administrativa que realmente la requiera y siempre como variable privada de servidor.

## Verificación rápida

Después de ejecutar el SQL:

1. abre **Table Editor**;
2. verifica que exista `organizations`;
3. debe contener `TIBOX` y `Cliente Demo`;
4. verifica `organization_memberships`;
5. cada usuario Auth que existía al ejecutar el script debe tener dos membresías;
6. verifica `product_decisions`: deben existir 23 filas para TIBOX;
7. abre la aplicación e inicia sesión con uno de los usuarios existentes.

## Si agregas otro usuario después

El trigger crea automáticamente su fila en `profiles`, pero **no le entrega membresía**. Mientras no implementemos invitaciones, asígnala manualmente desde SQL.

Ejemplo para dar acceso al espacio TIBOX:

```sql
insert into public.organization_memberships (organization_id, user_id, role)
select o.id, u.id, 'org_admin'
from public.organizations o
join auth.users u on lower(u.email) = lower('CORREO_DEL_USUARIO')
where o.slug = 'tibox'
on conflict (organization_id, user_id)
do update set role = excluded.role, status = 'active';
```

No guardes correos reales dentro de migraciones versionadas si no es necesario.

## Cambios posteriores

No editar una migración que ya haya sido aplicada en producción. Para futuras modificaciones se crea un archivo nuevo en:

```text
supabase/migrations/
```

con timestamp posterior, por ejemplo:

```text
20260827100000_add_invitations.sql
```
