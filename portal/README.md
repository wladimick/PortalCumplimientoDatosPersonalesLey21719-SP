# Portal SharePoint — prototipo legado

Esta carpeta contiene la primera prueba de concepto basada en SharePoint Online + página clásica + Script Editor.

## Estado

**LEGADO / SOLO REFERENCIA.**

El producto objetivo es TIBOX Compliance como SaaS multi-tenant en Next.js + Vercel + Supabase.

No agregar nuevas funcionalidades a `portal.html` salvo necesidad explícita de demo o corrección histórica.

## Qué se reutiliza conceptualmente

- módulos de Ley 21.719;
- estructura de dashboard;
- assessment de seguridad;
- experiencia de evidencias;
- aprendizajes de las listas iniciales.

## Qué no se reutiliza como arquitectura

- Script Editor;
- custom scripts SharePoint;
- dependencia de páginas clásicas;
- listas SharePoint como única base de datos;
- despliegue manual por tenant.

Ver `/docs` para la arquitectura vigente.