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
| Commit docs UI/UX | `3412f29e472d438f86403d814a2f3ea892e5a35d` |
| Commit implementación | `c04ef8637927cd88478a22f9913c2338a455237c` |
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

### Validación

- Validación de build/preview: se registra en el PR #4 antes del merge.
- La migración no debe ejecutarse hasta completar dicha validación.

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
