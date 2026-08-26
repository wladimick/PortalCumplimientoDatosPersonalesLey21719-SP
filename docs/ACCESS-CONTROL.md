# TIBOX Compliance — Control de acceso

## Objetivo

Permitir acceso simple por correo sin confundir autenticación con autorización, manteniendo aislamiento fuerte entre clientes.

## Modelo

```text
Correo / identidad
      ↓
Supabase Auth
      ↓
profiles
      ↓
organization_access_grants
      ↓
organization_memberships
      ↓
RLS
      ↓
Datos de la organización
```

## Regla

**Autenticarse nunca es suficiente para ver datos.**

Una persona puede obtener una sesión válida y ver “Usuario sin organización asignada” si su correo no fue autorizado en el panel.

## Métodos de autenticación

### MVP

- correo + contraseña para usuarios ya creados;
- magic link enviado al correo.

El magic link puede crear la identidad Auth, pero el trigger solo genera membresía cuando existe un `organization_access_grants` activo para ese correo.

### Futuro

- Microsoft Entra ID / Office 365 como SSO preferente para administradores TIBOX;
- opcionalmente también para clientes corporativos.

El SSO no reemplaza `organization_memberships` ni RLS.

## Allowlist

Tabla: `organization_access_grants`.

Campos clave:

- `organization_id`
- `email`
- `role`
- `status`
- `created_by`

Un grant activo sincroniza la membresía si el usuario ya existe. Si el usuario se crea después, `handle_new_user()` aplica grants activos por correo.

## Roles de cliente

- `org_admin`: administración del cliente.
- `compliance_manager`: gestión de cumplimiento.
- `contributor`: carga/actualización operativa.
- `auditor`: lectura orientada a auditoría.
- `viewer`: lectura.

## Roles TIBOX

- `platform_admin`: administración global y operaciones destructivas.
- `platform_support`: soporte/gestión no destructiva.

Piloto:

- `wdiaz@tibox.cl` → Wladimick Diaz → `platform_admin`.
- `pfarias@tibox.cl` → Paula Farías → `platform_support`.

## Revocación

Revocar un grant:

1. cambia `organization_access_grants.status` a `inactive`;
2. trigger sincroniza membresía a `inactive`;
3. la siguiente consulta deja de pasar `is_org_member`;
4. se registra `access.revoked` en auditoría del cliente.

No es necesario borrar la identidad Auth si la persona mantiene acceso a otras organizaciones.

## Amenazas cubiertas

- URL manual hacia otro cliente → RLS/membresía bloquean.
- Usuario autenticado sin grant → sin organización visible.
- Cambio de `organization_id` en formulario → server action valida contexto/IDs.
- Frontend manipulado → RLS sigue aplicando.
- Service role expuesta → mitigado manteniéndola exclusivamente server-side.

## Pendientes futuros

- invitaciones con expiración;
- verificación de dominio corporativo;
- SSO Entra ID;
- MFA/step-up para acciones destructivas;
- sesiones y dispositivos visibles;
- expiración temporal de accesos de auditor.
