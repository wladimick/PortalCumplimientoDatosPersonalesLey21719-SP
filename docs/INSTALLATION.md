# Instalación del prototipo SharePoint — LEGADO

> **Estado:** documento histórico. La arquitectura objetivo del proyecto es ahora una aplicación SaaS propia TIBOX basada en Next.js + Vercel + Supabase. Ver [`ARCHITECTURE.md`](ARCHITECTURE.md).
>
> El prototipo `portal/portal.html` se conserva para referencia/demostración. No se recomienda invertir nuevas funcionalidades en esta modalidad salvo decisión explícita.

## Propósito del prototipo

La primera exploración usó una página clásica SharePoint con Script Editor Web Part para demostrar:

- navegación de portal;
- lectura de listas SharePoint;
- resumen ejecutivo;
- módulos de Ley 21.719;
- assessment técnico;
- diseño distinto de las vistas nativas de SharePoint.

## Requisitos históricos

- SharePoint Online;
- permisos de propietario;
- custom script temporalmente permitido;
- página clásica;
- Script Editor Web Part;
- listas de datos en el mismo sitio.

## Instalación histórica

1. Abrir Centro de administración de SharePoint.
2. Ir a Sitios > Sitios activos.
3. Seleccionar el sitio.
4. Abrir Configuración > Scripts personalizados.
5. Permitir scripts temporalmente.
6. Crear/usar una página clásica.
7. Agregar Script Editor.
8. Pegar el contenido completo de `portal/portal.html`.
9. Guardar/publicar.

El portal buscaba las listas:

- `Módulos del Portal`;
- `Matriz de Cumplimiento`;
- `Assessment de Seguridad`;
- `Categorías de Seguridad`;
- `Resumen Ejecutivo`.

## Por qué ya no es la solución objetivo

El nuevo requerimiento es una plataforma propia de TIBOX con:

- vista por cliente;
- administración central;
- producto multi-tenant;
- dominio propio;
- mantenimiento centralizado;
- capacidad para clientes con o sin SharePoint;
- integraciones opcionales con Microsoft 365.

SharePoint puede volver como proveedor de evidencias/integración, pero no como frontend principal.

## No eliminar todavía

Conservar esta documentación y `portal/portal.html` hasta que el nuevo SaaS alcance un MVP funcional, para mantener trazabilidad del cambio de arquitectura.