# Integraciones

## Principio

TIBOX Compliance debe funcionar sin depender de Microsoft 365. Las integraciones agregan capacidades, pero no definen el núcleo del producto.

## Microsoft 365 / SharePoint

### Casos de uso

- almacenar evidencias en SharePoint del cliente;
- listar/abrir evidencias existentes;
- sincronizar metadata seleccionada;
- en el futuro, leer señales de seguridad o configuración cuando exista autorización y valor funcional.

### Arquitectura

```text
TIBOX Compliance
  │
  ├─ metadata / estado → Supabase
  │
  └─ EvidenceProvider
       └─ SharePointProvider
            └─ Microsoft Graph
                 └─ Tenant cliente
                      └─ Sitio / biblioteca autorizada
```

### Reglas

- consentimiento explícito;
- scopes mínimos;
- tokens solo server-side;
- asociación inequívoca `organization_id ↔ Microsoft tenant`;
- no permitir conectar un tenant Microsoft a una organización equivocada;
- revocación disponible;
- auditoría de conexión/desconexión;
- health status de integración;
- reintentos controlados e idempotencia.

### Modelo de configuración

Metadata no secreta:

- tenant id;
- site id;
- drive/library id;
- folder/root id;
- estado;
- última sincronización.

Secretos/tokens no deben quedar expuestos a RLS de usuarios finales ni en `NEXT_PUBLIC_*`.

## Supabase Storage

Proveedor de evidencia nativo opcional.

Ruta lógica sugerida:

```text
organizations/{organization_id}/evidence/{evidence_id}/{safe_filename}
```

El path no reemplaza RLS/policies. Bucket privado.

## Correo / notificaciones

Proveedor pendiente.

Casos de uso futuros:

- invitación a usuario;
- obligación próxima a vencer;
- acción vencida;
- evidencia próxima a expirar;
- reporte programado;
- alerta de integración desconectada.

No seleccionar proveedor hasta definir volumen, remitente y necesidad de plantillas/auditoría.

## WebOps TIBOX

Integración potencial futura, no parte del MVP base.

Ejemplos:

- señales de MFA;
- backups;
- postura de seguridad;
- disponibilidad;
- controles técnicos verificados automáticamente.

La integración debe ocurrir mediante API/contrato de datos y no acceso directo a tablas de otra aplicación.

## IA

Fuera del MVP. Si se incorpora posteriormente:

- no enviar evidencia a un modelo sin política y autorización;
- redacción/minimización cuando corresponda;
- registro de qué fuente se usó;
- evitar que la IA cambie estados de cumplimiento sin revisión humana;
- separar sugerencia de decisión.

## Patrón técnico de conectores

Cada integración implementará un contrato claro:

```text
connect()
disconnect()
healthCheck()
sync()
```

Para archivos:

```text
uploadEvidence()
downloadEvidence()
deleteEvidence()
getMetadata()
```

Esto evita lógica condicional dispersa por toda la UI.

## Observabilidad

Cada integración debe registrar:

- estado actual;
- última operación exitosa;
- último error resumido y sanitizado;
- número de intentos;
- request/correlation id cuando exista.

No guardar payloads sensibles completos en logs.