# Decisiones pendientes — Paula / Negocio

Este documento reúne decisiones que **no deben ser cerradas solo por desarrollo**. La implementación puede preparar opciones, pero Paula/negocio debe confirmar el criterio.

## Cómo responder

Para cada punto, completar:

```text
Decisión:
Responsable:
Fecha:
Comentarios:
```

Cuando se cierre una decisión, moverla a la sección **Decisiones cerradas** con fecha.

---

## P01 — Nombre comercial del producto

**Pregunta:** ¿cómo se llamará frente a clientes?

Opciones iniciales:

- TIBOX Compliance
- TIBOX Cumplimiento
- Portal de Cumplimiento TIBOX
- otro nombre

**Recomendación técnica:** usar provisionalmente `TIBOX Compliance` en código/documentación y mantener el nombre configurable.

**Impacta:** branding, copy, dominio futuro, ventas y documentación.

**Estado:** PENDIENTE PAULA.

---

## P02 — Dominio

**Pregunta:** ¿se aprueba `cumplimiento.tibox.cl` como dominio productivo?

**Recomendación:** sí; es claro, corporativo y no amarra el producto a una sola ley.

**Estado:** PENDIENTE PAULA.

---

## P03 — Alcance del producto

**Pregunta:** ¿el producto nace exclusivamente para Ley 21.719 o como plataforma para múltiples marcos de cumplimiento?

Opciones:

A. Solo Ley 21.719.
B. Ley 21.719 primero, arquitectura multi-framework.
C. Suite de cumplimiento desde el MVP.

**Recomendación:** B. Evita sobrecargar el MVP pero no encierra el modelo.

**Estado:** PENDIENTE PAULA.

---

## P04 — Quiénes son los clientes objetivo

**Pregunta:** ¿solo clientes con Microsoft 365 o cualquier cliente TIBOX?

**Recomendación:** cualquier cliente. Microsoft 365 debe ser integración opcional.

**Impacta:** autenticación y almacenamiento de evidencias.

**Estado:** PENDIENTE PAULA.

---

## P05 — Autenticación

**Pregunta:** ¿qué métodos de acceso ofrecemos?

Opciones:

A. Solo Microsoft 365 / Entra ID.
B. Microsoft + magic link/correo.
C. Microsoft + email/password.

**Recomendación:** Microsoft prioritario + alternativa segura para clientes sin M365. Evitar password propio si magic link/OTP satisface el caso.

**Estado:** PENDIENTE PAULA.

---

## P06 — MFA

**Pregunta:** ¿MFA será obligatorio para administradores y/o todos los usuarios?

**Recomendación:** obligatorio para roles TIBOX privilegiados y `org_admin`; evaluar resto según proveedor de identidad.

**Estado:** PENDIENTE PAULA / Seguridad.

---

## P07 — Dónde se guardan las evidencias

Opciones:

A. Supabase Storage para todos.
B. SharePoint del cliente para todos con M365.
C. Configurable por cliente: Supabase o SharePoint.

**Recomendación:** C a nivel de producto; para MVP elegir un proveedor inicial y mantener abstracción.

**Pregunta adicional:** si el MVP usa Supabase Storage, ¿TIBOX está autorizado comercial/legalmente para alojar estos documentos?

**Estado:** PENDIENTE PAULA / Legal / Seguridad.

---

## P08 — Acceso del equipo TIBOX a información del cliente

**Pregunta:** ¿qué puede ver soporte/consultoría TIBOX?

Opciones:

A. acceso global permanente;
B. acceso por rol y contrato;
C. acceso temporal con motivo/ticket y auditoría;
D. acceso solo con aprobación del cliente.

**Recomendación:** C como mínimo; D para clientes que lo requieran.

**Estado:** PENDIENTE PAULA.

---

## P09 — Roles del cliente

Propuesta:

- Administrador cliente
- Encargado de cumplimiento
- Responsable/Colaborador
- Auditor
- Solo lectura

**Pregunta:** ¿son suficientes? ¿Consultor externo necesita rol separado?

**Estado:** PENDIENTE PAULA.

---

## P10 — Branding por cliente

**Pregunta:** ¿la plataforma siempre se ve TIBOX o se permitirá personalización del cliente?

Opciones:

A. 100% TIBOX.
B. TIBOX + logo/nombre del cliente.
C. white-label completo.

**Recomendación:** B. Conserva identidad de producto y contextualiza la organización.

**Estado:** PENDIENTE PAULA.

---

## P11 — Score de cumplimiento

**Pregunta:** ¿cómo se calcula el porcentaje global?

Se debe definir:

- peso de cada obligación;
- tratamiento de `no_aplica`;
- diferencia entre parcial/no cumplido;
- controles críticos;
- vencimientos;
- si un assessment técnico afecta el score legal.

**Recomendación:** no inventar fórmula desde desarrollo. Negocio/compliance debe aprobarla y versionarla.

**Estado:** PENDIENTE PAULA / Especialista cumplimiento.

---

## P12 — Catálogo legal y contenido base

**Pregunta:** ¿quién es dueño del contenido maestro de Ley 21.719, descripciones, referencias, evidencias sugeridas y recomendaciones?

**Recomendación:** definir un responsable funcional y versionar el catálogo.

**Estado:** PENDIENTE PAULA.

---

## P13 — Auditoría visible para el cliente

**Pregunta:** ¿el cliente puede ver todo el historial de su organización o solo cambios funcionales seleccionados?

**Recomendación:** mostrar auditoría de negocio relevante; reservar detalles técnicos/seguridad internos.

**Estado:** PENDIENTE PAULA.

---

## P14 — Retención

Definir plazos para:

- evidencias;
- auditoría;
- cuentas desactivadas;
- datos de ex-clientes;
- backups;
- exports.

**Recomendación:** acordar política contractual y luego implementar automatización.

**Estado:** PENDIENTE PAULA / Legal.

---

## P15 — Exportación y término de contrato

**Pregunta:** ¿qué recibe el cliente al finalizar?

Propuesta:

- Excel/CSV de datos estructurados;
- PDF de reporte final;
- ZIP o acceso a evidencias si están en TIBOX;
- referencias si están en SharePoint;
- constancia de cierre/borrado según contrato.

**Estado:** PENDIENTE PAULA.

---

## P16 — Notificaciones

**Pregunta:** ¿qué notificaciones forman parte del MVP?

Posibles:

- tareas asignadas;
- vencimientos;
- evidencia por vencer;
- invitación;
- reporte periódico;
- hallazgo crítico.

**Recomendación:** MVP: invitación + asignación + vencimiento. Evitar exceso inicial.

**Estado:** PENDIENTE PAULA.

---

## P17 — Reportes

**Pregunta:** ¿qué entregables espera el cliente?

Opciones iniciales:

- dashboard web;
- PDF ejecutivo;
- Excel de matriz;
- informe técnico;
- reporte periódico automático.

**Estado:** PENDIENTE PAULA.

---

## P18 — Modelo comercial

**Pregunta:** ¿se vende como licencia SaaS, servicio administrado, parte de consultoría o combinación?

Impacta:

- límites por usuarios/clientes;
- soporte;
- acceso TIBOX;
- almacenamiento;
- SLA;
- features por plan.

**Estado:** PENDIENTE PAULA / Comercial.

---

## P19 — SLA y soporte

Definir:

- horario de soporte;
- canal;
- severidades;
- tiempos de respuesta;
- disponibilidad comprometida;
- RTO/RPO si se ofrecen contractualmente.

**Estado:** PENDIENTE PAULA / Operaciones.

---

## P20 — Región y residencia de datos

**Pregunta:** ¿existe requisito de región específica para base de datos, archivos y backups?

**Recomendación:** decidir antes de crear Supabase producción porque cambiar región posteriormente puede requerir migración.

**Estado:** PENDIENTE PAULA / Seguridad / Legal.

---

## P21 — Uso de IA

**Pregunta:** ¿IA forma parte del roadmap comercial?

Posibles usos futuros:

- sugerir evidencias;
- resumir brechas;
- redactar planes;
- explicar controles.

**Recomendación:** fuera del MVP y sin enviar evidencia sensible hasta tener política aprobada.

**Estado:** PENDIENTE PAULA.

---

## P22 — Integración con WebOps

**Pregunta:** ¿TIBOX Compliance debe consumir señales técnicas de WebOps en una fase posterior?

**Recomendación:** sí como roadmap, mediante API y sin acoplar bases de datos.

**Estado:** PENDIENTE PAULA / Producto.

---

## P23 — Repositorio/nombre técnico

El repo actual conserva el nombre histórico `PortalCumplimientoDatosPersonalesLey21719-SP`.

**Pregunta:** ¿renombrarlo a algo como `Tibox-Compliance` una vez aprobado el foco?

**Recomendación:** sí antes de conectar producción/Vercel, para evitar arrastrar `SP` y una ley específica en el nombre técnico.

**Estado:** PENDIENTE PAULA / Equipo.

---

# Decisiones cerradas

Aún no hay decisiones de negocio registradas como cerradas en esta fase.