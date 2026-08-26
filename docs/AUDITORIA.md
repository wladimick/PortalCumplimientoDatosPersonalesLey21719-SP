# Auditoría y trazabilidad

## Objetivo

La aplicación debe poder responder quién hizo qué, sobre qué cliente, cuándo y desde qué flujo, sin depender de logs técnicos efímeros.

## Tipos de registro

### 1. Auditoría de negocio

Fuente principal para cambios funcionales:

- obligación/control creado o modificado;
- cambio de estado;
- cambio de responsable;
- revisión;
- acción creada/cerrada;
- evidencia cargada/eliminada;
- membresía o rol modificado;
- configuración cambiada;
- exportación relevante.

### 2. Eventos de seguridad

- acceso de soporte;
- intentos de autorización denegados reiterados;
- conexión/revocación de integraciones;
- operaciones privilegiadas;
- cambios de seguridad.

### 3. Logs técnicos

Vercel/Supabase para errores, performance y diagnóstico. No sustituyen `audit_events`.

## Tabla `audit_events`

Campos mínimos:

- `id`
- `organization_id`
- `actor_user_id`
- `actor_type`
- `action`
- `entity_type`
- `entity_id`
- `request_id`
- `summary`
- `before_data` opcional y sanitizado
- `after_data` opcional y sanitizado
- `metadata` sanitizado
- `created_at`

## Propiedades

- append-only para usuarios normales;
- orden cronológico estable;
- no editable desde UI;
- no almacenar secretos, tokens ni contenido binario;
- minimizar PII dentro de snapshots;
- registrar al actor real incluso en modo soporte;
- permitir filtrar por organización, actor, entidad, acción y fecha.

## Taxonomía sugerida

```text
auth.login
membership.created
membership.role_changed
membership.revoked
control.status_changed
control.owner_changed
control.reviewed
action.created
action.completed
evidence.uploaded
evidence.deleted
integration.connected
integration.disconnected
support.access_started
support.access_ended
export.generated
organization.settings_changed
```

Usar claves técnicas estables y textos traducibles aparte.

## Antes/después

No registrar objetos completos indiscriminadamente.

Ejemplo apropiado:

```json
{
  "before": { "status": "in_progress" },
  "after": { "status": "compliant" }
}
```

Evitar copiar notas extensas, documentos, tokens o PII que no sea necesaria para demostrar el cambio.

## Integridad

MVP:

- prohibir UPDATE/DELETE vía permisos y RLS;
- crear eventos desde servidor o triggers controlados.

Evolución posible:

- particionamiento por fecha;
- hash encadenado por evento;
- exportación periódica a almacenamiento inmutable;
- SIEM externo.

No implementar complejidad criptográfica hasta conocer requisitos contractuales/regulatorios.

## Retención

**Pendiente de decisión.** Se debe definir una política explícita para:

- auditoría de negocio;
- logs de seguridad;
- logs técnicos;
- evidencias eliminadas;
- datos de ex-clientes.

La retención no debe elegirse solo por costo técnico.

## Vista de auditoría

Cliente autorizado:

- cambios de su organización;
- filtros;
- detalle de evento;
- exportación según rol.

TIBOX:

- eventos de plataforma;
- eventos de soporte;
- eventos de organizaciones solo según permisos y política.

## Correlación

Cada operación sensible genera `request_id`. Si una acción provoca varios cambios, todos comparten ese identificador para reconstruir el flujo.

## Criterios de aceptación

Una mutación sensible no está terminada si no existe una respuesta clara a:

1. ¿qué evento genera?;
2. ¿qué actor se registra?;
3. ¿qué tenant se registra?;
4. ¿qué datos antes/después son necesarios?;
5. ¿qué información debe excluirse del log?.