# Roadmap — TIBOX Compliance

## Fase 0 — Definición

Estado: **en curso**.

- [x] reenfocar de SharePoint a SaaS;
- [x] arquitectura multi-tenant;
- [x] modelo de datos propuesto;
- [x] seguridad base;
- [x] auditoría;
- [x] dominio propuesto;
- [x] Design System TIBOX aplicado;
- [x] listado de decisiones de negocio;
- [ ] respuestas de Paula/negocio;
- [ ] responsable funcional del catálogo Ley 21.719;
- [ ] alcance MVP congelado.

## Fase 1 — Fundación técnica

- [ ] renombrar repo si se aprueba;
- [ ] proyecto Next.js;
- [ ] Vercel;
- [ ] Supabase dev;
- [ ] variables de entorno;
- [ ] lint/typecheck/build;
- [ ] shell visual TIBOX;
- [ ] manejo de errores;
- [ ] observabilidad inicial.

## Fase 2 — Identidad y multi-tenant

- [ ] Supabase Auth;
- [ ] método Microsoft/alternativo según decisión;
- [ ] organizations;
- [ ] profiles;
- [ ] memberships;
- [ ] roles plataforma/cliente;
- [ ] RLS;
- [ ] selector de organización;
- [ ] pruebas de aislamiento entre tenants;
- [ ] consola TIBOX básica.

**Gate:** no avanzar con datos reales hasta aprobar pruebas de aislamiento.

## Fase 3 — Motor de cumplimiento

- [ ] frameworks;
- [ ] módulos;
- [ ] templates de controles;
- [ ] instancias por organización;
- [ ] catálogo Ley 21.719;
- [ ] estados y responsables;
- [ ] filtros/búsqueda;
- [ ] dashboard y score aprobado;
- [ ] historial de revisiones.

## Fase 4 — Assessment y plan de acción

- [ ] categorías técnicas;
- [ ] assessment de seguridad;
- [ ] niveles/riesgos;
- [ ] recomendaciones;
- [ ] acciones;
- [ ] responsables;
- [ ] vencimientos;
- [ ] dashboard de brechas.

## Fase 5 — Evidencias

- [ ] `EvidenceProvider`;
- [ ] proveedor inicial aprobado;
- [ ] carga segura;
- [ ] descarga autorizada;
- [ ] metadata;
- [ ] vigencia;
- [ ] auditoría;
- [ ] límites de archivo;
- [ ] malware scanning si corresponde;
- [ ] proveedor SharePoint posterior si se aprueba.

## Fase 6 — Auditoría y reportes

- [ ] `audit_events` append-only;
- [ ] visor de auditoría;
- [ ] exportaciones autorizadas;
- [ ] reporte ejecutivo;
- [ ] Excel/CSV matriz;
- [ ] PDF si se aprueba;
- [ ] retención automatizada cuando exista política.

## Fase 7 — Notificaciones

- [ ] proveedor de correo;
- [ ] invitaciones;
- [ ] asignaciones;
- [ ] vencimientos;
- [ ] preferencias;
- [ ] tareas idempotentes;
- [ ] historial básico de notificación.

## Fase 8 — Microsoft 365

- [ ] app registration/modelo de consentimiento;
- [ ] Microsoft Graph;
- [ ] conexión por organización;
- [ ] selección sitio/biblioteca;
- [ ] SharePoint Evidence Provider;
- [ ] health check/reconexión;
- [ ] auditoría;
- [ ] documentación para administradores cliente.

## Fase 9 — Producción

- [ ] Supabase producción/región aprobada;
- [ ] Vercel producción;
- [ ] `cumplimiento.tibox.cl`;
- [ ] headers seguridad;
- [ ] revisión RLS;
- [ ] prueba de restauración;
- [ ] incident response;
- [ ] privacidad/términos;
- [ ] SLA/soporte;
- [ ] piloto interno;
- [ ] cliente piloto;
- [ ] checklist go-live.

## Fase 10 — Evolución

Posibles líneas:

- WebOps;
- controles automáticos;
- más marcos;
- IA asistiva;
- reportes programados;
- API pública/privada;
- SSO empresarial avanzado;
- white-label si se decide;
- SIEM/auditoría inmutable.

## Regla de priorización

Primero:

1. aislamiento;
2. seguridad;
3. datos correctos;
4. operación;
5. UX;
6. automatización avanzada.

No sacrificar las primeras cuatro por acelerar una demo.