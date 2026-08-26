# Documentación — TIBOX Compliance

Orden recomendado de lectura:

1. [`PRODUCTO.md`](PRODUCTO.md) — visión, usuarios y alcance.
2. [`FUNCIONAMIENTO.md`](FUNCIONAMIENTO.md) — flujos y lógica funcional.
3. [`STACK.md`](STACK.md) — stack tecnológico.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) — arquitectura y límites de confianza.
5. [`MODELO-DATOS.md`](MODELO-DATOS.md) — entidades y relaciones.
6. [`ROLES-PERMISOS.md`](ROLES-PERMISOS.md) — RBAC y contexto multi-tenant.
7. [`ACCESS-CONTROL.md`](ACCESS-CONTROL.md) — allowlist, magic link, roles de plataforma y futuro SSO.
8. [`SEGURIDAD.md`](SEGURIDAD.md) — amenazas y controles.
9. [`AUDITORIA.md`](AUDITORIA.md) — trazabilidad.
10. [`PRIVACIDAD-GOBIERNO-DATOS.md`](PRIVACIDAD-GOBIERNO-DATOS.md) — clasificación, retención y término.
11. [`CLIENT-OFFBOARDING.md`](CLIENT-OFFBOARDING.md) — eliminación segura de clientes y datos.
12. [`INTEGRACIONES.md`](INTEGRACIONES.md) — Microsoft 365, SharePoint y otras integraciones.
13. [`DOMINIO-DESPLIEGUE.md`](DOMINIO-DESPLIEGUE.md) — Vercel, ambientes y dominio.
14. [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) — base visual TIBOX.
15. [`UI-UX-BIBLE.md`](UI-UX-BIBLE.md) — fuente normativa de componentes y comportamiento UI/UX.
16. [`DEVELOPMENT-GUIDE.md`](DEVELOPMENT-GUIDE.md) — cómo continuar el código sin romper arquitectura/seguridad.
17. [`OPERACION.md`](OPERACION.md) — soporte y continuidad.
18. [`ROADMAP.md`](ROADMAP.md) — plan de implementación.
19. [`DECISIONES-PAULA.md`](DECISIONES-PAULA.md) — decisiones de negocio pendientes.
20. [`AI-DEVELOPMENT-LOG.md`](AI-DEVELOPMENT-LOG.md) — fecha, modelo, PR, commits y lotes asistidos por IA.
21. [`SUPABASE-MANUAL.md`](SUPABASE-MANUAL.md) — instalación manual del esquema y RLS.
22. [`VERCEL-MANUAL.md`](VERCEL-MANUAL.md) — variables de entorno y deployment.
23. [`IMPORT-PAULA-SHAREPOINT.md`](IMPORT-PAULA-SHAREPOINT.md) — catálogo recuperado desde SharePoint.

## Implementación actual

Código ejecutable:

```text
app/
components/
lib/
```

Migraciones, en orden:

```text
supabase/migrations/20260826120000_initial_mvp.sql
supabase/migrations/20260826130000_import_paula_sharepoint_catalog.sql
supabase/migrations/20260826173000_access_governance_and_client_deletion.sql
```

Mientras Supabase no esté conectado a las herramientas de desarrollo, cualquier cambio de base debe entregarse como **una nueva migración SQL** para ejecución manual.

## Documento legado

[`INSTALLATION.md`](INSTALLATION.md) documenta el prototipo SharePoint anterior y se mantiene solo por trazabilidad.

## Regla de documentación

Un cambio que modifique arquitectura, modelo de datos, roles, seguridad, UI/UX o flujos relevantes debe actualizar el documento correspondiente en el mismo PR.
