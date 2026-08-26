# TIBOX Compliance — Registro de desarrollo asistido por IA

Este archivo registra lotes relevantes desarrollados con asistencia de IA. **Nunca registrar secretos, claves, tokens ni contraseñas.**

---

## 2026-08-26 — MVP UI/UX + gobierno de accesos

| Campo | Valor |
|---|---|
| Fecha | 2026-08-26 |
| Modelo | GPT-5.6 Sol |
| Rama | `feat/mvp-ui-governance` |
| PR | #4 — `feat: UI/UX MVP, accesos y gobierno de clientes` |
| Base | `e04158ee6759736d6afc7befd194059e5a5d3910` |
| Commit Biblia UI/UX | `3412f29e472d438f86403d814a2f3ea892e5a35d` |
| Commit implementación | `c04ef8637927cd88478a22f9913c2338a455237c` |
| Commit documentación | `66422d6850b0366b75e1df77000885c6e1f82034` |
| Commit aislamiento UI | `9b8db746e44c981e95e13c8d0bd9acc946fcd89f` |
| Commit revisión seguridad | `c6d233825565cd85aff063e2d812800fddd4ebe9` |
| Autoría operacional | Wladimick / ChatGPT |

### Objetivo

Transformar el primer MVP en una base de producto presentable a Paula y mantenible por terceros, incorporando sistema visual TIBOX, vista ejecutiva de cliente, accesibilidad, búsqueda, tablas avanzadas y gobierno de acceso/baja.

### Cambios

- Biblia UI/UX normativa.
- Logo TIBOX oficial convertido a componente React.
- Titillium Web mantenida como fuente principal.
- Login reducido a “Bienvenido a TIBOX Compliance”.
- Password + magic link.
- Topbar con búsqueda global, tema claro/oscuro y escala tipográfica.
- Dashboard ejecutivo de cliente sin sidebar/topbar.
- KPIs documental/técnico/evidencia/acciones/riesgos.
- DataTable reutilizable con filtro, sorting, columnas visibles, persistencia y CSV.
- Formularios para nuevas obligaciones, controles y acciones.
- Búsqueda server-side dentro de la organización.
- `platform_admin` / `platform_support`.
- allowlist por correo (`organization_access_grants`).
- panel Administración.
- revocación de acceso.
- baja irreversible de clientes con RPC y limpieza Auth huérfana.
- responsive, impresión ejecutiva, reduced motion y focus visible.

### Migración nueva

```text
supabase/migrations/20260826173000_access_governance_and_client_deletion.sql
```

Debe ejecutarse manualmente **después del merge** y después de las dos migraciones del MVP ya instaladas.

### Decisiones técnicas

- Autenticación y autorización siguen separadas.
- Magic link puede crear identidad, pero sin grant activo no crea acceso a organización.
- SSO Microsoft 365 futuro no reemplazará RLS/membresías.
- Wladimick queda como `platform_admin` en el seed de migración.
- Paula queda como `platform_support` en el seed de migración.
- La eliminación de cliente conserva solo auditoría mínima sin PII.
- Evidencias binarias requerirán borrado provider-aware antes de producción real.

### Revisión del PR

La revisión automática detectó cinco observaciones que se corrigieron antes del merge:

1. reconciliar membresías cuando cambia el correo Auth;
2. contar todas las acciones abiertas sin depender del límite del preview;
3. sanear términos antes de construir filtros PostgREST;
4. impedir open redirect en el callback de autenticación;
5. neutralizar fórmulas al exportar CSV.

Los cinco threads quedaron respondidos y resueltos en el PR #4. Las correcciones principales están en `c6d233825565cd85aff063e2d812800fddd4ebe9`.

### Validación pre-merge

- Integración Vercel nueva (`portal-cumplimiento-datos-personales-ley21719-sp`, cuenta `Tibox C`): **SUCCESS** sobre `c6d233825565cd85aff063e2d812800fddd4ebe9`.
- La integración Vercel antigua `tiboxcompliance` continuó fallando únicamente por el límite de builds de la cuenta Hobby anterior; no corresponde al proyecto Vercel activo elegido para este producto.
- PR #4: mergeable; todos los hallazgos de revisión quedaron resueltos antes del merge.

### Post-merge

Después del merge:

1. verificar el deployment de `main` en la cuenta Vercel activa;
2. ejecutar manualmente la migración `20260826173000_access_governance_and_client_deletion.sql`;
3. validar que Wladimick vea Administración y Paula tenga rol de soporte;
4. probar allowlist/revocación con un usuario de prueba antes de usar clientes reales;
5. no probar eliminación definitiva sobre un cliente real hasta completar el checklist de `CLIENT-OFFBOARDING.md`.

---

## Regla para futuras entradas

Registrar como mínimo:

- fecha;
- modelo;
- rama;
- PR;
- commit(s);
- objetivo;
- migraciones;
- pruebas;
- riesgos o decisiones relevantes.
