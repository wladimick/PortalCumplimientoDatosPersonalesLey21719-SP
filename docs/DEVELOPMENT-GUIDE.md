# TIBOX Compliance — Guía de desarrollo seguro

> **Fecha base:** 2026-08-26  
> **Modelo IA:** GPT-5.6 Sol  
> **Objetivo:** permitir que Paula u otro desarrollador continúe el producto sin romper aislamiento multi-tenant, migraciones, UI/UX ni despliegues.

## 1. Regla principal

Todo cambio debe respetar este orden mental:

```text
AUTH → TENANT → PERMISSION → VALIDATION → MUTATION → AUDIT → SIDE EFFECTS
```

Nunca confiar en que un botón oculto o una ruta no enlazada protege datos.

## 2. Flujo Git obligatorio

1. Actualizar `main` y revisar el estado real del código.
2. Crear una rama descriptiva: `feat/...`, `fix/...`, `docs/...`.
3. Implementar cambios relacionados en un lote coherente.
4. Actualizar documentación afectada en el mismo PR.
5. Ejecutar/validar typecheck, build y preview.
6. Abrir PR con alcance, riesgos, migraciones y pruebas.
7. No mergear si el deployment/CI falla.
8. Hacer merge a `main` solo cuando el lote esté validado.
9. Revisar producción tras el merge.

Evitar decenas de commits diminutos porque cada push puede disparar previews y consumir cuota de Vercel.

## 3. Stack actual

- Next.js 16 App Router.
- React 19.
- TypeScript estricto.
- Supabase Auth + PostgreSQL + RLS.
- Vercel.
- Lucide React.
- CSS nativo en `app/globals.css`.
- Titillium Web mediante `next/font/google`.

Las versiones exactas se consultan en `package.json`. No actualizar dependencias “por costumbre”; hacerlo en PR separado cuando sea posible.

## 4. Estructura

```text
app/
  app/[orgSlug]/        rutas privadas por organización
  auth/                 callbacks/cierre de sesión
  login/                autenticación
components/
  auth/                  formularios de acceso
  brand/                 marca TIBOX
  portal/                shell, tablas y componentes de producto
lib/
  data/                  consultas RLS-aware
  supabase/              clientes server/browser/admin
  portal.ts              contexto de usuario/organización/roles
supabase/migrations/     evolución versionada de base
docs/                    arquitectura, producto, seguridad y UI/UX
```

## 5. Migraciones Supabase

### Regla irreversible

**Nunca editar una migración que ya fue ejecutada en Supabase.**

Si cambia una tabla, función, trigger, policy o índice:

1. crear un archivo nuevo con timestamp;
2. hacerlo idempotente cuando sea razonable;
3. documentar dependencia/orden;
4. incluir RLS en el mismo cambio;
5. probar sobre entorno no productivo cuando exista;
6. entregar la ruta exacta para ejecución manual mientras Supabase no esté conectado a ChatGPT.

Ejemplo:

```text
supabase/migrations/20260826173000_access_governance_and_client_deletion.sql
```

## 6. RLS

Cada tabla con datos de cliente debe incluir `organization_id` salvo justificación explícita.

Toda consulta de cliente debe estar protegida por RLS. El frontend no debe usar `service_role`.

`SUPABASE_SERVICE_ROLE_KEY`:

- solo servidor;
- nunca `NEXT_PUBLIC_`;
- nunca se imprime en logs;
- nunca se envía al navegador;
- se reserva para tareas administrativas que la API Auth requiere, como eliminar usuarios huérfanos durante offboarding.

## 7. Server Actions

Toda mutación debe:

- obtener la sesión actual;
- resolver organización por `orgSlug`;
- comprobar rol;
- verificar que IDs relacionados pertenezcan a la misma organización;
- ejecutar la mutación con Supabase;
- crear auditoría cuando corresponda;
- `revalidatePath` de las vistas afectadas.

No aceptar `organization_id` del navegador como prueba de autorización.

## 8. Autenticación vs autorización

Autenticación responde “¿quién eres?”. Autorización responde “¿qué organización y qué acciones puedes usar?”.

Un usuario puede autenticarse con magic link y aun así no ver ningún cliente. Eso es correcto si su correo no tiene grant/membresía activa.

Futuro SSO Microsoft 365 debe reemplazar/complementar autenticación, no el modelo de autorización.

## 9. Componentes UI

Antes de crear uno nuevo revisar `docs/UI-UX-BIBLE.md`.

Patrones actuales reutilizables:

- `TiboxBrand`
- `PortalShell`
- `Sidebar`
- `Topbar`
- `GlobalSearch`
- `AccessibilityControls`
- `DataTable`
- `StatusBadge`
- cards/KPIs/formularios mediante clases globales

Si un nuevo patrón es aprobado, actualizar la Biblia UI/UX en el mismo PR.

## 10. Tablas

Usar `DataTable` para vistas tabulares antes de crear tablas ad-hoc.

Soporta:

- filtro textual;
- filtro de estado;
- sorting;
- columnas visibles;
- persistencia local;
- CSV.

No poner lógica de permisos dentro de `DataTable`: la página/servidor decide qué acciones existen.

## 11. Variables de entorno

Públicas permitidas:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Secretas:

```text
SUPABASE_SERVICE_ROLE_KEY
MICROSOFT_CLIENT_SECRET
```

No crear una variable nueva sin documentarla en `.env.example`.

## 12. Vercel

Producción sigue `main`.

Antes de merge:

- preview debe compilar;
- revisar errores de runtime si la página carga pero falla;
- evitar redeploys repetitivos sin cambio de código;
- verificar variables de Production y Preview.

Dominio objetivo: `cumplimiento.tibox.cl`. Mientras se configura, usar dominio Vercel oficial del proyecto.

## 13. Añadir una nueva página

Checklist:

1. ruta bajo `/app/[orgSlug]/...`;
2. `getOrganizationContext(orgSlug)` en servidor;
3. permisos explícitos;
4. consultas filtradas por `organization.id`;
5. navegación solo si corresponde al rol;
6. responsive + claro/oscuro;
7. documentación si introduce un patrón;
8. auditoría si modifica datos.

## 14. Añadir una columna a una entidad

1. nueva migración;
2. revisar constraint/default;
3. revisar RLS;
4. actualizar `lib/data/...`;
5. actualizar formulario si se edita;
6. actualizar `DataTable` si se muestra;
7. actualizar docs de modelo de datos.

## 15. Borrado de datos

Nunca implementar un borrado de cliente como `delete()` directo desde React.

Seguir `docs/CLIENT-OFFBOARDING.md`.

## 16. IA y trazabilidad

Todo lote desarrollado con IA debe registrar en `docs/AI-DEVELOPMENT-LOG.md`:

- fecha/hora aproximada;
- modelo;
- objetivo;
- rama;
- PR;
- commits principales;
- migraciones;
- validaciones;
- decisiones/riesgos.

No registrar secretos, contraseñas, tokens ni service-role keys.

## 17. Definition of Done

Un cambio está terminado cuando:

- compila;
- respeta RLS/permisos;
- no filtra datos entre tenants;
- funciona responsive;
- funciona claro/oscuro si toca UI;
- tiene focus/teclado razonable;
- actualiza docs relevantes;
- registra migración nueva si cambia DB;
- PR explica impacto;
- producción se verifica después del merge.
