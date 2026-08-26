# TIBOX Compliance — Portal de Cumplimiento

Aplicación SaaS multi-tenant de TIBOX para que cada cliente gestione y visualice su cumplimiento, obligaciones, controles, responsables, evidencias, planes de acción y auditoría desde una experiencia propia de TIBOX.

> **Dominio propuesto:** `https://cumplimiento.tibox.cl`
>
> **Estado:** arquitectura y producto en definición. Las decisiones de negocio pendientes están centralizadas en [`docs/DECISIONES-PAULA.md`](docs/DECISIONES-PAULA.md).

## Cambio de foco

El proyecto nació como un portal HTML sobre SharePoint. Ese prototipo se conserva como referencia técnica en `portal/`, pero **ya no es la arquitectura objetivo**.

La solución objetivo es una aplicación web propia:

```text
Usuario cliente / Equipo TIBOX
          │
          ▼
 cumplimiento.tibox.cl
          │
   Next.js + React
          │
        Vercel
          │
  ┌───────┴────────┐
  │                │
Supabase       Integraciones
Auth/DB/Storage   Microsoft 365
  │                │
  └───────┬────────┘
          ▼
     Datos por cliente
```

## Objetivos

- Una sola aplicación central mantenida por TIBOX.
- Vista segregada por cliente/organización.
- Administración global para TIBOX sin mezclar datos entre clientes.
- Seguridad multi-tenant respaldada por Row Level Security, no solo por la interfaz.
- Trazabilidad completa de cambios relevantes.
- Soportar Ley N° 21.719 como primer marco y dejar preparada la arquitectura para otros marcos.
- Permitir evidencias en Supabase Storage o, en una etapa posterior, en Microsoft SharePoint según política de cada cliente.
- Desplegar mediante GitHub + Vercel con previews por Pull Request.
- Mantener un sistema visual consistente con la marca TIBOX.

## Stack propuesto

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 + React + TypeScript |
| Hosting / CI-CD | Vercel |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth; Microsoft Entra ID como opción prioritaria |
| Autorización | PostgreSQL RLS + roles de aplicación |
| Archivos | Proveedor abstraído: Supabase Storage y futura integración SharePoint |
| Validación | Zod |
| UI | CSS/Tailwind siguiendo el Design System TIBOX |
| Iconografía | Lucide / SVG de línea |
| Observabilidad | Vercel + eventos de aplicación + auditoría propia |
| Código | GitHub |

## Principio multi-tenant

Toda información perteneciente a un cliente debe estar asociada a `organization_id` y protegida por políticas RLS.

```text
Usuario
  └─ membership
      └─ organization_id
          ├─ obligaciones
          ├─ controles
          ├─ acciones
          ├─ evidencias
          └─ reportes
```

Un usuario de una organización **no debe poder consultar otra organización aunque altere la URL, el JavaScript o una llamada API**.

## Roles iniciales propuestos

- `platform_admin`: administración global TIBOX.
- `platform_support`: soporte TIBOX con acceso controlado y auditable.
- `org_admin`: administrador del cliente.
- `compliance_manager`: encargado de cumplimiento.
- `contributor`: responsable que actualiza controles/acciones/evidencias.
- `auditor`: revisión y observaciones.
- `viewer`: solo lectura.

Los alcances exactos deben validarse antes de producción.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PRODUCTO.md`](docs/PRODUCTO.md) | visión, usuarios, módulos y alcance |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | arquitectura objetivo y límites |
| [`docs/MODELO-DATOS.md`](docs/MODELO-DATOS.md) | entidades y reglas multi-tenant |
| [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) | modelo de amenazas y controles |
| [`docs/ROLES-PERMISOS.md`](docs/ROLES-PERMISOS.md) | RBAC + RLS |
| [`docs/AUDITORIA.md`](docs/AUDITORIA.md) | bitácora, trazabilidad y retención |
| [`docs/PRIVACIDAD-GOBIERNO-DATOS.md`](docs/PRIVACIDAD-GOBIERNO-DATOS.md) | clasificación y tratamiento de datos |
| [`docs/INTEGRACIONES.md`](docs/INTEGRACIONES.md) | SharePoint, Microsoft 365 y extensiones |
| [`docs/DOMINIO-DESPLIEGUE.md`](docs/DOMINIO-DESPLIEGUE.md) | Vercel, dominio y ambientes |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | aplicación del sistema visual TIBOX |
| [`docs/OPERACION.md`](docs/OPERACION.md) | soporte, backups, observabilidad y respuesta |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | fases de implementación |
| [`docs/DECISIONES-PAULA.md`](docs/DECISIONES-PAULA.md) | preguntas de negocio pendientes |
| [`docs/INSTALLATION.md`](docs/INSTALLATION.md) | instalación del prototipo SharePoint legado |

## Estructura objetivo

```text
/
├── app/                       # Next.js App Router
├── components/                # UI reutilizable
├── lib/                       # auth, seguridad, datos, integraciones
├── public/
├── supabase/
│   └── migrations/            # esquema y políticas RLS versionadas
├── docs/
├── portal/                    # prototipo SharePoint legado
├── .env.example
├── package.json
└── README.md
```

## Alcance inicial del producto

### MVP cliente

1. Inicio / Resumen ejecutivo.
2. Matriz de cumplimiento Ley 21.719.
3. Módulos y obligaciones.
4. Assessment de seguridad.
5. Responsables y plan de acción.
6. Evidencias.
7. Historial / auditoría visible según rol.
8. Reportes básicos.

### MVP TIBOX

1. Selector/listado de clientes.
2. Estado resumido de cada cliente.
3. Gestión de organizaciones y usuarios.
4. Acceso de soporte explícito y auditado.
5. Catálogo maestro de marcos, controles y plantillas.

## Seguridad: reglas no negociables

- RLS habilitado en todas las tablas con datos de cliente.
- `SUPABASE_SERVICE_ROLE_KEY` solo en servidor; nunca en navegador.
- Validación de entrada en servidor.
- Separación entre rol TIBOX y rol dentro de una organización.
- Auditoría append-only para acciones sensibles.
- Evidencias privadas por defecto.
- Principio de mínimo privilegio.
- Secretos solo en variables de entorno de Vercel/Supabase.
- Ningún dato sensible en logs técnicos o errores mostrados al usuario.

## Prototipo SharePoint legado

`portal/portal.html` se mantiene como referencia de la primera exploración. No se considera el frontend objetivo ni debe recibir nuevas funcionalidades salvo correcciones necesarias para conservar la demo.

## Próximo hito

Cerrar las decisiones de [`docs/DECISIONES-PAULA.md`](docs/DECISIONES-PAULA.md), congelar el alcance MVP y recién después implementar autenticación, esquema Supabase, RLS y shell de la aplicación.
