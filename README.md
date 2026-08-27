# TIBOX Compliance

Aplicación SaaS multi-tenant de TIBOX para que cada cliente gestione y visualice cumplimiento, obligaciones, controles, responsables, evidencias, planes de acción y auditoría desde una experiencia propia.

> **Dominio objetivo:** `https://cumplimiento.tibox.cl`
>
> **Estado actual:** MVP ejecutable en desarrollo con autenticación Supabase, aislamiento multi-tenant, dashboard, matrices de cumplimiento/seguridad y gobierno de clientes desde el espacio interno TIBOX.

## Cambio de foco

El proyecto nació como un portal HTML sobre SharePoint. Ese prototipo se conserva en `portal/` como referencia histórica, pero **ya no es la arquitectura objetivo**.

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
  ┌───────┴────────────┐
  │                    │
Supabase          Integraciones
Auth/PostgreSQL     Microsoft 365
  │                    │
  └────────┬───────────┘
           ▼
      Organizaciones
      aisladas por RLS
```

## Stack del MVP

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.3 + React 19 + TypeScript |
| Hosting / CI-CD | Vercel |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth con SSR/cookies |
| Autorización | PostgreSQL Row Level Security + membresías por organización |
| Archivos | Modelo preparado; proveedor pendiente de decisión P07 |
| UI | CSS propio basado en Design System TIBOX/WebOps |
| Iconografía | Lucide React |
| Código | GitHub |

La implementación SSR usa `@supabase/ssr`; no utiliza los antiguos `auth-helpers`.

## Qué funciona en esta iteración

- Login por contraseña y magic link.
- Sesión SSR y protección de rutas con `proxy.ts`.
- Selector de organizaciones.
- Contexto multi-tenant por `organization_id`.
- Dashboard ejecutivo.
- Nueve módulos de cumplimiento.
- Matriz de obligaciones Ley 21.719.
- Assessment técnico por categorías.
- Plan de acción.
- Navegación preparada para Evidencias y Reportes.
- Espacio interno TIBOX.
- Roles de plataforma `platform_admin` y `platform_support`.
- Administración interna de accesos por correo y rol.
- Alta de clientes desde **TIBOX → Administración** para `platform_admin`.
- Provisioning transaccional de módulos, obligaciones y controles desde la plantilla `cliente-demo`.
- Baja irreversible de clientes reservada a `platform_admin`.
- Tablero de decisiones de producto para Paula.
- Registro de cambios y eventos relevantes en auditoría.
- RLS en todas las tablas de negocio del MVP.

## Instalación de Supabase — por ahora manual

Las migraciones deben ejecutarse en orden:

```text
supabase/migrations/20260826120000_initial_mvp.sql
supabase/migrations/20260826130000_import_paula_sharepoint_catalog.sql
supabase/migrations/20260826173000_access_governance_and_client_deletion.sql
supabase/migrations/20260826203000_superadmin_client_provisioning.sql
```

Mientras el proyecto Supabase de TIBOX Compliance no esté conectado a las herramientas de desarrollo, ejecutar cada archivo pendiente desde **Supabase > SQL Editor**.

Guía detallada: [`docs/SUPABASE-MANUAL.md`](docs/SUPABASE-MANUAL.md).

La instalación mantiene dos espacios base:

- `TIBOX`: espacio interno de gobierno de plataforma.
- `Cliente Demo`: plantilla funcional y tenant de demostración.

## Super Admin y alta de clientes

Los administradores globales actuales son:

- `wdiaz@tibox.cl` → `platform_admin`
- `pfarias@tibox.cl` → `platform_admin`

Desde `/app/tibox/administracion` un Super Admin puede:

- crear un cliente;
- definir nombre, RUT y slug;
- asignar el administrador inicial por correo;
- seleccionar su rol inicial;
- cargar automáticamente la plantilla Ley 21.719;
- agregar o revocar accesos posteriores;
- eliminar definitivamente un cliente cuando corresponda.

La creación se ejecuta mediante una función PostgreSQL transaccional. Si falla la copia del catálogo o la asignación inicial, el alta completa se revierte.

Guía de operación: [`docs/ALTA-CLIENTES.md`](docs/ALTA-CLIENTES.md).

## Variables requeridas

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` es privada y se usa únicamente en operaciones administrativas de servidor que realmente la requieren, como la limpieza de usuarios Auth huérfanos durante el offboarding. Nunca debe usar prefijo `NEXT_PUBLIC_`.

## Ejecución local

```bash
npm install
npm run dev
```

Luego abrir `http://localhost:3000`.

## Seguridad multi-tenant

Toda información de cliente debe llevar `organization_id`. El aislamiento no depende del menú ni de esconder botones: se valida en PostgreSQL mediante RLS.

```text
Auth user
   │
   ▼
organization_memberships
   │
   ├─ TIBOX
   └─ Cliente X
          │
          ├─ obligations
          ├─ security_controls
          ├─ action_items
          ├─ evidence
          └─ audit_events
```

Un usuario no debe poder acceder a una organización distinta modificando la URL o haciendo llamadas directas a Supabase.

### Roles de plataforma implementados

- `platform_admin`
- `platform_support`

### Roles del cliente implementados

- `org_admin`
- `compliance_manager`
- `contributor`
- `auditor`
- `viewer`

Los roles de plataforma y los roles dentro de una organización son independientes. Ser `platform_admin` no convierte automáticamente al usuario en miembro de todos los clientes; el acceso a datos de un cliente debe quedar explícitamente autorizado.

## Reglas de seguridad del MVP

- RLS habilitado en todas las tablas de negocio.
- Clave publishable únicamente en cliente; ningún secreto administrativo en navegador.
- `audit_events` es append-only para usuarios de aplicación.
- Membresía obligatoria para entrar al contexto funcional de una organización.
- Escritura limitada por rol.
- Alta y baja de clientes vuelven a validar `platform_admin` en PostgreSQL.
- La creación de clientes no hereda responsables, fechas, acciones ni evidencias del tenant plantilla.
- Evidencias físicas no se habilitan hasta cerrar P07.
- La fórmula de score actual es demostrativa y no debe presentarse como criterio legal definitivo hasta cerrar P11.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PRODUCTO.md`](docs/PRODUCTO.md) | visión, usuarios, módulos y alcance |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | arquitectura y límites |
| [`docs/MODELO-DATOS.md`](docs/MODELO-DATOS.md) | entidades y multi-tenancy |
| [`docs/SEGURIDAD.md`](docs/SEGURIDAD.md) | amenazas y controles |
| [`docs/ROLES-PERMISOS.md`](docs/ROLES-PERMISOS.md) | RBAC + RLS |
| [`docs/AUDITORIA.md`](docs/AUDITORIA.md) | bitácora y trazabilidad |
| [`docs/PRIVACIDAD-GOBIERNO-DATOS.md`](docs/PRIVACIDAD-GOBIERNO-DATOS.md) | gobierno de datos |
| [`docs/INTEGRACIONES.md`](docs/INTEGRACIONES.md) | Microsoft 365 / SharePoint / WebOps |
| [`docs/DOMINIO-DESPLIEGUE.md`](docs/DOMINIO-DESPLIEGUE.md) | Vercel, dominio y ambientes |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | sistema visual TIBOX |
| [`docs/OPERACION.md`](docs/OPERACION.md) | operación y continuidad |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | fases |
| [`docs/DECISIONES-PAULA.md`](docs/DECISIONES-PAULA.md) | decisiones de negocio |
| [`docs/SUPABASE-MANUAL.md`](docs/SUPABASE-MANUAL.md) | instalación manual de base/RLS/seed |
| [`docs/ALTA-CLIENTES.md`](docs/ALTA-CLIENTES.md) | operación del Super Admin y provisioning de clientes |

## Estructura actual

```text
/
├── app/                         # Next.js App Router
│   ├── login/
│   ├── auth/
│   └── app/[orgSlug]/
├── components/
├── lib/
│   ├── data/
│   └── supabase/
├── supabase/
│   └── migrations/
├── docs/
├── portal/                      # prototipo SharePoint legado
├── proxy.ts
├── .env.example
├── package.json
└── README.md
```

## Próximos pasos inmediatos

1. Ejecutar las migraciones pendientes en TIBOX Compliance.
2. Validar que Paula aparezca como `Administrador TIBOX`.
3. Crear un cliente QA desde `/app/tibox/administracion`.
4. Verificar copia de catálogo y aislamiento RLS.
5. Validar acceso del administrador inicial mediante magic link.
6. Con las decisiones de producto cerradas, continuar evidencias, reportes, integraciones y modelo comercial.
