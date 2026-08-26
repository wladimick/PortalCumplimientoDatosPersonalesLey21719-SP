# Documentación — TIBOX Compliance

Orden recomendado de lectura:

1. [`PRODUCTO.md`](PRODUCTO.md) — visión, usuarios y alcance.
2. [`FUNCIONAMIENTO.md`](FUNCIONAMIENTO.md) — flujos y lógica funcional.
3. [`STACK.md`](STACK.md) — stack tecnológico.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) — arquitectura y límites de confianza.
5. [`MODELO-DATOS.md`](MODELO-DATOS.md) — entidades y relaciones.
6. [`ROLES-PERMISOS.md`](ROLES-PERMISOS.md) — RBAC y contexto multi-tenant.
7. [`SEGURIDAD.md`](SEGURIDAD.md) — amenazas y controles.
8. [`AUDITORIA.md`](AUDITORIA.md) — trazabilidad.
9. [`PRIVACIDAD-GOBIERNO-DATOS.md`](PRIVACIDAD-GOBIERNO-DATOS.md) — clasificación, retención y término.
10. [`INTEGRACIONES.md`](INTEGRACIONES.md) — Microsoft 365, SharePoint y otras integraciones.
11. [`DOMINIO-DESPLIEGUE.md`](DOMINIO-DESPLIEGUE.md) — Vercel, ambientes y dominio.
12. [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) — reglas visuales TIBOX.
13. [`OPERACION.md`](OPERACION.md) — soporte y continuidad.
14. [`ROADMAP.md`](ROADMAP.md) — plan de implementación.
15. [`DECISIONES-PAULA.md`](DECISIONES-PAULA.md) — decisiones de negocio pendientes.
16. [`SUPABASE-MANUAL.md`](SUPABASE-MANUAL.md) — instalación manual del esquema, RLS y seed del piloto.
17. [`VERCEL-MANUAL.md`](VERCEL-MANUAL.md) — variables de entorno, redeploy y validación del piloto.

## Implementación actual

La aplicación ejecutable vive en `app/`, `components/` y `lib/`. El esquema versionado del MVP está en:

```text
supabase/migrations/20260826120000_initial_mvp.sql
```

Mientras el nuevo proyecto Supabase no esté conectado a las herramientas de desarrollo, cualquier cambio de base debe entregarse como una nueva migración SQL para ejecución manual.

## Documento legado

[`INSTALLATION.md`](INSTALLATION.md) documenta el prototipo SharePoint anterior y se mantiene solo por trazabilidad.

## Regla de documentación

Un cambio que modifique arquitectura, modelo de datos, roles, seguridad o flujos relevantes debe actualizar el documento correspondiente en el mismo cambio.
