# TIBOX Compliance

Aplicación SaaS multi-tenant de TIBOX para que cada cliente gestione y visualice cumplimiento, obligaciones, controles, responsables, evidencias, planes de acción y auditoría desde una experiencia propia.

> **Dominio objetivo:** `https://cumplimiento.tibox.cl`
>
> **Estado actual:** MVP ejecutable en desarrollo. La aplicación Next.js, autenticación Supabase, shell multi-tenant, dashboard, matriz, assessment y tablero de decisiones para Paula ya están versionados en `main`.

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
| UI | CSS propio basado en Design System TIBOX |
| Iconografía | Lucide React |
| Código | GitHub |

La implementación SSR usa `@supabase/ssr`; no utiliza los antiguos `auth-helpers`.

## Qué funciona en esta iteración

- Login con usuarios existentes de Supabase Auth.
- Sesión SSR y protección de rutas con `proxy.ts`.
- Selector de organizaciones.
- Contexto multi-tenant por `organization_id`.
- Dashboard ejecutivo.
- Nueve módulos de cumplimiento.
- Matriz de obligaciones Ley 21.719 de demostración.
- Assessment técnico por categorías.
- Plan de acción.
- Navegación preparada para Evidencias y Reportes.
- Espacio interno TIBOX.
- Tablero de las 23 decisiones pendientes para Paula.
- Respuesta/estado de cada decisión directamente desde la aplicación.
- Registro de cambios de decisiones en `audit_events`.
- RLS en todas las tablas del MVP.

## Instalación de Supabase — por ahora manual

La fuente de verdad del esquema está en:

```text
supabase/migrations/20260826120000_initial_mvp.sql
```

Mientras el nuevo proyecto Supabase no esté conectado a las herramientas de desarrollo, copiar el SQL completo y ejecutarlo en **Supabase > SQL Editor**.

Guía detallada: [`docs/SUPABASE-MANUAL.md`](docs/SUPABASE-MANUAL.md).

El script crea dos espacios de piloto:

- `TIBOX`: espacio interno donde Paula puede responder decisiones.
- `Cliente Demo`: vista cliente en modo lectura.

Los usuarios Auth existentes al momento de ejecutar la migración se asignan temporalmente a ambos para facilitar la demo. Este bootstrap se reemplazará por invitaciones antes del primer cliente real.

## Variables requeridas

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No se necesita contraseña de PostgreSQL ni `service_role` para el frontend actual. No deben subirse al repositorio.

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
   └─ Cliente Demo
          │
          ├─ obligations
          ├─ security_controls
          ├─ action_items
          ├─ evidence
          └─ audit_events
```

Un usuario no debe poder acceder a una organización distinta modificando la URL o haciendo llamadas directas a Supabase.

### Roles del cliente implementados en el esquema

- `org_admin`
- `compliance_manager`
- `contributor`
- `auditor`
- `viewer`

Los roles de plataforma TIBOX (`platform_admin`, soporte temporal, etc.) siguen documentados como arquitectura futura y **todavía no se implementan** para no abrir acceso transversal prematuramente.

## Reglas de seguridad del MVP

- RLS habilitado en todas las tablas de negocio.
- Clave publishable únicamente en cliente; ningún secreto administrativo en navegador.
- `audit_events` es append-only para usuarios de aplicación.
- Membresía obligatoria para leer datos de una organización.
- Escritura limitada por rol.
- El bootstrap que entrega acceso a usuarios existentes es solo para la demo interna.
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

1. Ejecutar la migración inicial en el nuevo proyecto Supabase.
2. Configurar URL y publishable key en Vercel.
3. Validar login y RLS con los usuarios del piloto.
4. Compartir la aplicación con Paula.
5. Registrar sus respuestas en **Decisiones Paula**.
6. Con esas respuestas, congelar autenticación, evidencias, score, reportes, modelo comercial y residencia de datos antes de continuar con funcionalidades productivas.
