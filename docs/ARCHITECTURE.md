# Arquitectura objetivo — TIBOX Compliance

## 1. Propósito

TIBOX Compliance será una aplicación SaaS multi-tenant operada por TIBOX. Cada cliente accede a una vista aislada de su organización y TIBOX dispone de una capa administrativa global.

La Ley N° 21.719 es el primer marco funcional, pero la arquitectura debe permitir incorporar otros marcos, evaluaciones o servicios sin rehacer el núcleo.

## 2. Principios

1. **Multi-tenant desde la base de datos.** La separación de clientes no depende de filtros React.
2. **Backend seguro.** Toda operación privilegiada ocurre en servidor.
3. **Mínimo privilegio.** Usuarios, soporte e integraciones reciben solo el acceso necesario.
4. **Auditable por diseño.** Cambios sensibles generan eventos de auditoría.
5. **Proveedor de evidencias desacoplado.** La UI no depende de Supabase Storage o SharePoint.
6. **Una sola base de código.** Configuración por organización, no forks por cliente.
7. **Evolución incremental.** Empezar con Ley 21.719 y crecer por módulos.

## 3. Componentes

```text
Internet
  │
  ▼
cumplimiento.tibox.cl
  │
  ▼
Vercel / Next.js
  ├─ React UI
  ├─ Server Components
  ├─ Route Handlers / Server Actions
  ├─ autorización de aplicación
  └─ integraciones
        │
        ├──────────────┐
        ▼              ▼
     Supabase       Microsoft 365
   ┌───────────┐       Graph
   │ Auth      │         │
   │ Postgres  │      SharePoint
   │ Storage   │     (opcional)
   └───────────┘
```

## 4. Frontend

**Next.js 16 + React + TypeScript**, App Router.

Responsabilidades:

- renderizar dashboard, matrices, controles y formularios;
- navegación por organización;
- componentes del Design System TIBOX;
- accesibilidad y responsive;
- mostrar solo acciones permitidas al usuario.

La ocultación de botones es UX, **no seguridad**. La seguridad real se resuelve en servidor y RLS.

## 5. Backend de aplicación

Se priorizan Server Components, Server Actions o Route Handlers para operaciones que requieren validación, autorización, secretos o integración con APIs externas.

Reglas:

- validar payloads con Zod;
- resolver usuario y organización en servidor;
- no aceptar `organization_id` del navegador como fuente de confianza sin comprobar membership;
- no exponer claves privilegiadas;
- generar `request_id` para trazabilidad de operaciones sensibles.

## 6. Supabase

### Auth

Supabase Auth administra sesiones. La opción prioritaria para clientes corporativos es Microsoft Entra ID. Se deja abierta la posibilidad de login por correo para clientes sin Microsoft 365, sujeto a decisión de producto.

### PostgreSQL

Fuente principal de verdad para:

- organizaciones;
- usuarios y memberships;
- marcos de cumplimiento;
- módulos y obligaciones;
- assessments;
- responsables y planes de acción;
- referencias a evidencias;
- configuración de integraciones;
- auditoría.

### Row Level Security

Todas las tablas que contienen datos de cliente incluyen `organization_id` y políticas RLS.

Patrón conceptual:

```sql
organization_memberships
  user_id
  organization_id
  role

obligations
  organization_id
  ...
```

Una consulta a `obligations` solo retorna filas cuya organización esté incluida en las memberships autorizadas del usuario.

## 7. Separación entre plataforma y organización

No mezclar permisos TIBOX con permisos del cliente.

```text
platform role
  ├─ platform_admin
  └─ platform_support

organization role
  ├─ org_admin
  ├─ compliance_manager
  ├─ contributor
  ├─ auditor
  └─ viewer
```

Una persona puede pertenecer a múltiples organizaciones, pero cada operación debe ejecutarse en un contexto de organización explícito.

## 8. Evidencias

Se define una interfaz lógica `EvidenceProvider`.

```text
EvidenceProvider
  ├─ SupabaseStorageProvider
  └─ SharePointProvider   (fase posterior)
```

La base de datos conserva metadata común:

- organización;
- obligación/control asociado;
- nombre de archivo;
- tipo de evidencia;
- proveedor;
- identificador externo/objeto;
- fecha de carga;
- cargado por;
- vigencia opcional;
- checksum opcional.

Así se puede cambiar el almacenamiento sin reescribir los módulos funcionales.

## 9. Microsoft 365 / SharePoint

SharePoint deja de ser el frontend. Pasa a ser una integración opcional para organizaciones que quieran mantener evidencias en su tenant.

La integración se realizará mediante Microsoft Graph y deberá definir:

- consentimiento por cliente;
- modalidad delegada o aplicación;
- sitio/biblioteca destino;
- permisos mínimos;
- tratamiento de tokens;
- reconexión y revocación.

No se implementará hasta cerrar la decisión de producto y seguridad correspondiente.

## 10. Auditoría

La auditoría de negocio vive en PostgreSQL y no depende de los logs efímeros de Vercel.

Eventos mínimos:

- inicio/cierre de sesión relevante;
- cambios de roles o memberships;
- creación/edición/cierre de obligaciones y acciones;
- carga/eliminación de evidencia;
- cambios de configuración;
- acceso de soporte TIBOX a un cliente;
- conexión/desconexión de integraciones;
- exportaciones sensibles.

`audit_events` será append-only para usuarios de aplicación.

## 11. Ambientes

```text
local        → desarrollo
preview      → Vercel Preview por PR
production   → cumplimiento.tibox.cl
```

Cada ambiente usa proyecto/configuración separada o secretos separados. Nunca se reutilizan claves productivas en previews no confiables.

## 12. Límites de confianza

```text
[Browser]
   │ datos no confiables
   ▼
[Next.js server]
   │ identidad validada
   ▼
[Supabase + RLS]

[Next.js server]
   │ secreto / token externo
   ▼
[Microsoft Graph]
```

Todo dato proveniente del navegador se considera no confiable.

## 13. Prototipo SharePoint

El archivo `portal/portal.html` se conserva únicamente como prototipo histórico y referencia visual/funcional. No forma parte de la arquitectura de producción objetivo.

## 14. Decisiones abiertas

Las decisiones que afectan alcance, almacenamiento, autenticación, soporte y posicionamiento comercial están en [`DECISIONES-PAULA.md`](DECISIONES-PAULA.md). No deben cerrarse por implementación implícita.