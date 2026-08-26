# Producto — TIBOX Compliance

## Visión

Construir una plataforma propia de TIBOX que permita a cada cliente conocer su estado de cumplimiento, trabajar obligaciones y controles, asignar responsables, adjuntar evidencias, gestionar acciones y mantener trazabilidad.

La experiencia debe sentirse como un producto TIBOX, no como una personalización de SharePoint.

## Usuarios

### Cliente

- Dirección / gerencia: lectura ejecutiva.
- Encargado de cumplimiento: administra matriz, responsables, acciones y evidencias.
- Responsables de área: actualizan obligaciones asignadas.
- Auditor/revisor: revisa, observa y valida.
- Lectores: acceso sin edición.

### TIBOX

- Administrador de plataforma: configuración global.
- Soporte: atención controlada y auditable.
- Consultor: acompañamiento a clientes según contrato y autorización.

## Experiencia por cliente

Cada usuario entra a la misma aplicación, pero ve únicamente las organizaciones donde tiene membership.

```text
Inicio
├─ Resumen ejecutivo
├─ Cumplimiento Ley 21.719
│  ├─ Información y transparencia
│  ├─ Derechos de titulares
│  ├─ Seguridad y confidencialidad
│  ├─ Incidentes y vulneraciones
│  ├─ Privacidad desde el diseño
│  ├─ Terceros y encargados
│  ├─ Evaluaciones de impacto
│  └─ Prevención y cumplimiento
├─ Assessment de seguridad
├─ Plan de acción
├─ Evidencias
├─ Reportes
└─ Configuración (según rol)
```

## Consola TIBOX

Vista global para usuarios autorizados de TIBOX:

- organizaciones activas;
- avance general por cliente;
- obligaciones vencidas;
- riesgos críticos;
- assessments pendientes;
- estado de integraciones;
- gestión de usuarios y memberships;
- acceso de soporte con trazabilidad.

No debe ser posible abrir datos de un cliente solo por conocer su ID. Todo acceso global debe estar explícitamente autorizado.

## Objetos principales

- Organización.
- Usuario.
- Membership y rol.
- Marco de cumplimiento.
- Módulo.
- Obligación/control.
- Estado de cumplimiento.
- Responsable.
- Evidencia.
- Acción/plan de remediación.
- Evaluación/assessment.
- Comentario/observación.
- Reporte.
- Integración.
- Evento de auditoría.

## Estados iniciales propuestos

Para obligaciones y controles:

- `not_started`
- `in_progress`
- `compliant`
- `partially_compliant`
- `not_compliant`
- `not_applicable`

Para acciones:

- `open`
- `in_progress`
- `blocked`
- `done`
- `cancelled`

Los textos visibles pueden localizarse al español sin usar el label como valor técnico.

## KPIs iniciales

- porcentaje de cumplimiento;
- obligaciones totales;
- cumplidas;
- parcialmente cumplidas;
- no cumplidas;
- pendientes;
- vencidas;
- evidencias vigentes;
- acciones abiertas;
- riesgos altos/críticos;
- controles de seguridad por estado.

Las fórmulas definitivas de score requieren validación de negocio.

## Alcance MVP

### Incluye

1. Autenticación.
2. Multi-tenant y roles.
3. Dashboard del cliente.
4. Matriz Ley 21.719.
5. Assessment de seguridad.
6. Responsables.
7. Plan de acción.
8. Evidencias.
9. Auditoría básica.
10. Reporte/exportación básica.
11. Consola administrativa TIBOX.

### No incluir inicialmente salvo decisión explícita

- facturación;
- firma electrónica;
- flujo BPM complejo;
- chatbot/IA con acceso a evidencia;
- automatización avanzada de Microsoft 365;
- conectores distintos de Microsoft 365;
- marketplace de terceros;
- aplicación móvil nativa.

## Principio de producto

Una funcionalidad nueva debe poder responder:

1. ¿Pertenece a una organización o a la plataforma?
2. ¿Qué rol puede verla?
3. ¿Qué rol puede modificarla?
4. ¿Debe quedar auditada?
5. ¿Contiene datos personales o evidencia sensible?
6. ¿Cómo se exporta/elimina al terminar el contrato?

## Decisiones pendientes

Ver [`DECISIONES-PAULA.md`](DECISIONES-PAULA.md).