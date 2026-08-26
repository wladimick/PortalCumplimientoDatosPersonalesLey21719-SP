# TIBOX Compliance — Baja y eliminación de clientes

## Propósito

Definir un proceso técnico para eliminar datos de un cliente cuando termina la relación, existe solicitud válida o vence la retención acordada.

Esto es una capacidad de gobierno de datos; no debe tratarse como un simple botón CRUD.

## Alcance MVP

La administración interna permite eliminar organizaciones externas. La organización interna TIBOX está protegida y no puede borrarse por esta función.

## Controles previos

La operación exige:

- usuario autenticado;
- rol `platform_admin`;
- cliente externo;
- motivo categorizado;
- confirmación escribiendo exactamente el `slug`;
- función PostgreSQL `SECURITY DEFINER` que valida nuevamente.

## Flujo

```text
UI Danger Zone
   ↓
Server Action
   ↓
verifica platform_admin
   ↓
verifica service role disponible
   ↓
RPC delete_customer_org(...)
   ↓
borra audit_events del cliente
   ↓
borra organizations
   ↓
ON DELETE CASCADE
   ↓
datos dependientes
   ↓
registra evento mínimo platform_audit_events
   ↓
devuelve user_ids afectados
   ↓
Admin API Supabase Auth
   ↓
elimina identidades huérfanas
```

## Datos eliminados por cascada / relación

Según el esquema actual:

- memberships;
- módulos;
- obligaciones;
- categorías;
- controles técnicos;
- acciones;
- evidencia (metadata);
- decisiones de producto asociadas;
- allowlist;
- demás tablas con FK `organization_id ... on delete cascade`.

`audit_events` se elimina explícitamente porque su FK histórica usa `ON DELETE SET NULL`.

## Usuarios Auth

No se elimina automáticamente todo usuario que haya pertenecido al cliente.

Después de borrar la organización se comprueba cada usuario afectado:

- ¿tiene otra membresía activa?
- ¿tiene rol de plataforma activo?

Solo si ambas respuestas son no, se elimina la identidad Supabase Auth mediante `SUPABASE_SERVICE_ROLE_KEY` desde servidor.

## Auditoría residual

Se conserva únicamente un evento mínimo en `platform_audit_events`:

- actor (si sigue existiendo);
- acción `client.deleted`;
- UUID anterior de organización;
- `reason_code` categorizado;
- versión de esquema.

No se conserva en ese evento:

- nombre de cliente;
- RUT;
- correos;
- documentos;
- textos libres del cliente.

## Evidencias binarias

**Advertencia:** en el MVP actual `evidence` representa principalmente metadata. Cuando se habilite almacenamiento real, borrar la fila PostgreSQL no garantiza borrar el archivo físico.

Antes de producción con evidencia real debe implementarse un provider-aware offboarding:

### Supabase Storage

1. enumerar objetos por organización;
2. eliminar objetos;
3. confirmar resultado;
4. luego eliminar metadata/organización.

### SharePoint

1. resolver ubicación/document IDs;
2. ejecutar eliminación según acuerdo y permisos Microsoft Graph;
3. confirmar resultado;
4. luego eliminar referencias en TIBOX Compliance.

No declarar “borrado completo” si el proveedor externo no confirmó la eliminación.

## Backup y retención

La capacidad técnica de borrar no define por sí sola la política legal de retención/backups. Antes de producción se debe cerrar con negocio/legal:

- periodo de retención tras término;
- tratamiento de backups administrados;
- exportación previa solicitada por cliente;
- evidencia de ejecución del proceso.

## Pruebas obligatorias antes de usar con cliente real

- intentar borrar TIBOX → debe fallar;
- usuario `platform_support` → debe fallar;
- slug incorrecto → debe fallar;
- cliente demo → debe borrar dependencias;
- usuario compartido con otra organización → debe conservar Auth;
- usuario exclusivo → debe eliminar Auth;
- auditoría del cliente → no debe quedar huérfana;
- evento mínimo de plataforma → debe existir.
