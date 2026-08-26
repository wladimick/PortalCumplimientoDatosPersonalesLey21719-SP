# Stack tecnológico propuesto

## Resumen

```text
Next.js / React / TypeScript
        │
      Vercel
        │
     Supabase
 Auth + Postgres + Storage
        │
Integraciones opcionales
 Microsoft Graph / SharePoint
```

## Frontend y backend web

### Next.js 16

Motivos:

- React como base;
- App Router;
- Server Components;
- Route Handlers/Server Actions;
- integración natural con Vercel;
- una sola base de código para frontend y backend BFF;
- buen soporte para rendering autenticado.

### React

Para componentes interactivos, formularios, tablas, filtros y estados de UI.

### TypeScript

Obligatorio para código de aplicación. Evitar `any` salvo justificación puntual.

## UI

### Sistema visual

Design System TIBOX documentado en `DESIGN-SYSTEM.md`.

### Estilos

Propuesta: Tailwind CSS + variables/tokens propios TIBOX.

Regla: Tailwind acelera layout; los tokens de marca siguen siendo la fuente de verdad.

### Iconos

Lucide React / SVG lineal consistente.

### Formularios y validación

- validación server-side con Zod;
- validación cliente solo como ayuda UX;
- considerar React Hook Form cuando los formularios complejos lo justifiquen.

## Persistencia

### Supabase PostgreSQL

Fuente de verdad para datos de negocio.

Ventajas para este proyecto:

- PostgreSQL;
- RLS;
- migraciones;
- funciones/RPC cuando se requieran;
- integración con Supabase Auth.

### Supabase Auth

Sesiones e identidad. Microsoft Entra ID es proveedor prioritario a evaluar; mecanismo alternativo queda pendiente de decisión.

### Supabase Storage

Proveedor opcional para evidencias. Bucket privado y policies por organización.

## Hosting

### Vercel

- producción;
- preview deployments por PR;
- variables de entorno;
- rollback de frontend;
- logs/observabilidad técnica.

Dominio propuesto: `cumplimiento.tibox.cl`.

## Integraciones

### Microsoft Graph

Futura integración para SharePoint/Microsoft 365.

SharePoint se considera proveedor de documentos/evidencias, no frontend obligatorio.

## Librerías propuestas

Incorporar solo al momento de necesitarlas:

- `@supabase/supabase-js`;
- `@supabase/ssr`;
- `zod`;
- `lucide-react`;
- `react-hook-form` opcional;
- librería de fechas solo si el estándar nativo no basta.

Evitar dependencias UI grandes si el Design System propio cubre el caso.

## Testing

Propuesta:

- Vitest para lógica unitaria;
- Testing Library para componentes donde aporte valor;
- Playwright para flujos críticos;
- tests SQL/RLS para aislamiento multi-tenant.

Prioridades de pruebas:

1. RLS;
2. permisos;
3. cambios de estado/score;
4. evidencias;
5. acceso de soporte;
6. integraciones.

## Calidad

CI mínimo:

```text
lint
TypeScript typecheck
tests
build
RLS tests cuando cambia DB
```

## Dependencias deliberadamente no seleccionadas aún

- proveedor de email;
- analytics de producto;
- error tracking externo;
- job scheduler;
- malware scanning;
- PDF engine;
- editor rich text;
- AI provider.

Se elegirán cuando exista requerimiento concreto para evitar dependencia innecesaria.

## Versiones

Las versiones exactas de Node, Next, React, SDK Supabase y demás se fijarán al inicializar el scaffold y quedarán bloqueadas por `package-lock.json`. No se deben inventar versiones en documentación sin validarlas en ese momento.