# Operación, soporte y continuidad

## Objetivo

Definir cómo se operará TIBOX Compliance una vez que deje de ser solo desarrollo.

## Responsabilidades técnicas

### Desarrollo

- código;
- migraciones;
- pruebas;
- CI/CD;
- seguridad de aplicación;
- corrección de bugs.

### Operaciones/soporte

- estado del servicio;
- atención de incidentes;
- acceso de soporte auditado;
- coordinación con proveedores;
- recuperación cuando proceda.

### Producto/compliance

- catálogo legal;
- criterios de score;
- textos funcionales;
- reglas de negocio.

## Ambientes

- desarrollo: datos ficticios;
- preview/staging: QA;
- producción: clientes reales.

No copiar bases productivas a desarrollo sin un proceso de anonimización aprobado.

## Backups

La estrategia debe cubrir:

- PostgreSQL;
- evidencias en Supabase Storage si se usa;
- configuración crítica;
- capacidad de restauración.

Si las evidencias están en SharePoint, su continuidad depende también de la política Microsoft 365 del cliente.

El plan final debe documentar RPO/RTO solo después de validar capacidades y compromisos comerciales.

## Observabilidad

Panel operativo mínimo:

- disponibilidad aplicación;
- errores 5xx;
- latencia de operaciones críticas;
- errores Supabase;
- integraciones desconectadas;
- fallos de tareas programadas;
- tasa de errores de autorización anómala;
- estado de backups cuando sea verificable.

## Incidentes

Flujo inicial:

1. detectar;
2. clasificar severidad;
3. contener;
4. preservar evidencia técnica;
5. corregir;
6. recuperar;
7. validar;
8. comunicar según procedimiento;
9. retrospectiva;
10. acciones preventivas.

No confundir incidentes del servicio con incidentes de datos personales de un cliente; pueden tener flujos y responsabilidades distintas.

## Acceso a producción

- mínimo número de personas;
- MFA para roles privilegiados;
- secretos no compartidos por chat/correo;
- acciones sensibles auditadas;
- acceso de soporte al cliente con motivo y trazabilidad;
- evitar consultas manuales directas a datos salvo necesidad justificada.

## Cambios

Todo cambio productivo debe venir de código/migración versionada cuando sea posible.

Cambios urgentes:

- documentar causa;
- registrar quién ejecutó;
- crear cambio equivalente en Git si fue manual;
- revisar después del incidente.

## Gestión de dependencias

- actualizar dependencias regularmente;
- revisar vulnerabilidades;
- no hacer upgrades mayores directamente en producción;
- mantener Node/Next/Supabase SDK en versiones soportadas.

## Tareas programadas

Casos futuros:

- recordatorios de vencimiento;
- evidencias por expirar;
- reportes programados;
- limpieza según retención;
- health checks de integraciones.

Toda tarea debe ser idempotente y registrar resultado sin duplicar acciones.

## Offboarding de cliente

Checklist conceptual:

1. confirmar fecha de cierre;
2. bloquear/limitar cambios;
3. exportar datos;
4. entregar evidencia según contrato;
5. revocar integraciones;
6. deshabilitar memberships;
7. aplicar retención/borrado;
8. registrar operación;
9. confirmar cierre.

## Offboarding de usuario TIBOX

- revocar GitHub/Vercel/Supabase según funciones;
- revocar rol de plataforma;
- rotar secretos compartidos si existieran;
- revisar sesiones activas;
- conservar auditoría histórica con actor identificable.

## Documentación viva

Cambios de arquitectura, seguridad o modelo de datos deben actualizar `/docs` en el mismo PR. No aceptar cambios estructurales importantes sin documentación correspondiente.