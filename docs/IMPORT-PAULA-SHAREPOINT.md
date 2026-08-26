# Importación del trabajo previo de Paula en SharePoint

## Objetivo

Recuperar el contenido funcional que Paula construyó en listas de SharePoint y reutilizarlo como catálogo/datos iniciales del MVP de TIBOX Compliance, sin arrastrar la arquitectura de páginas clásicas ni enlaces internos de SharePoint.

## Archivos analizados

- `Módulos del Portal.csv`
- `Matriz de Cumplimiento.csv`
- `Categorías de Seguridad.csv`
- `Assessment de Seguridad.csv`
- `Resumen Ejecutivo.csv`

## Resultado del análisis

### Módulos del Portal

Se recuperan **9 módulos** con nombre, descripción, referencia legal y orden.

Los enlaces a páginas SharePoint (`/sites/PortalCumplimiento21719/...`) no se importan a la aplicación porque son dependencias de la solución anterior. La navegación será resuelta por rutas propias de TIBOX Compliance.

### Matriz de Cumplimiento

Se recuperan **24 obligaciones/evidencias solicitadas**, distribuidas en 8 módulos legales, con:

- título;
- artículo/referencia legal;
- descripción;
- estado inicial.

Todos los registros exportados están en estado `Pendiente`, que se normaliza a `pending`.

La lista usa `Terceros y encargados` mientras el catálogo de módulos usa `Terceros y encargados de tratamiento`; la migración resuelve explícitamente esa diferencia de nombre.

### Categorías de Seguridad

Se recuperan **7 categorías**:

1. Servidores
2. PCs / Endpoints
3. Correo / Microsoft 365
4. Firewall / Red
5. Backup / Continuidad
6. Aplicaciones SaaS / Bsale
7. Aplicaciones internas / ERP / CRM

### Assessment de Seguridad

Se recuperan **58 controles técnicos**.

Distribución por categoría:

- Servidores: 9
- PCs / Endpoints: 9
- Correo / Microsoft 365: 9
- Firewall / Red: 8
- Aplicaciones SaaS / Bsale: 8
- Aplicaciones internas / ERP / CRM: 8
- Backup / Continuidad: 7

Niveles:

- Básico: 34
- Avanzado: 24

Todos los controles están en estado `Pendiente`.

Existen dos títulos repetidos que **no son duplicados funcionales** porque pertenecen a categorías distintas:

- `Antivirus / EDR`: Servidores y PCs / Endpoints.
- `Bajas de usuarios`: Correo / Microsoft 365 y Aplicaciones SaaS / Bsale.

Se mantienen como controles independientes con códigos internos diferentes.

Los campos `Recomendación`, `Responsable`, `Fecha de Revisión` y `Observaciones` están vacíos en la exportación, por lo que no se inventa contenido.

### Adjuntos

Los CSV solo incluyen un contador `Datos adjuntos`.

Se detectó:

- 1 registro de la Matriz de Cumplimiento marcado con adjunto (`Inventario de tratamientos`).
- 1 control del Assessment marcado con adjunto (`Usuarios y roles` en Aplicaciones internas / ERP / CRM).

**Los archivos binarios no vienen incluidos en los CSV**, por lo que no pueden migrarse ni deben crearse evidencias ficticias. Si se quieren recuperar, deberán descargarse desde el SharePoint original y luego cargarse al proveedor de evidencias que se defina para el MVP.

## Resumen Ejecutivo: no importar como fuente de verdad

La lista `Resumen Ejecutivo` contiene valores estáticos:

- Avance documental: 67%
- Avance técnico: 43%
- Evidencias pendientes: 8
- Controles pendientes: 33

Sin embargo, la exportación de la Matriz contiene 24/24 obligaciones en `Pendiente` y el Assessment contiene 58/58 controles en `Pendiente`.

Por esa razón esos cuatro valores se conservan solo como **referencia de la maqueta/dashboard que Paula estaba armando** y no se cargan como indicadores autoritativos.

En TIBOX Compliance el resumen ejecutivo debe calcularse dinámicamente desde las obligaciones, controles, acciones y evidencias reales. La fórmula definitiva de score sigue sujeta a la decisión P11 de negocio/compliance.

## Migración creada

Archivo:

```text
supabase/migrations/20260826130000_import_paula_sharepoint_catalog.sql
```

Debe ejecutarse **después** de:

```text
supabase/migrations/20260826120000_initial_mvp.sql
```

La migración:

1. obtiene/crea `Cliente Demo` (`slug = cliente-demo`);
2. reemplaza el catálogo de módulos y assessment de esa organización demo;
3. carga los 9 módulos de Paula;
4. carga las 24 obligaciones;
5. carga las 7 categorías;
6. carga los 58 controles;
7. registra un evento `catalog.imported` en `audit_events`.

No modifica el tenant interno TIBOX ni las decisiones de Paula.

## Qué se reutiliza y qué no

| Elemento de SharePoint | Destino TIBOX Compliance | Decisión |
|---|---|---|
| Módulos | `compliance_modules` | Reutilizar |
| Matriz de Cumplimiento | `obligations` | Reutilizar |
| Categorías de Seguridad | `security_categories` | Reutilizar |
| Assessment de Seguridad | `security_controls` | Reutilizar |
| Resumen Ejecutivo | Dashboard calculado | No importar valores estáticos |
| Enlaces a páginas SharePoint | Rutas Next.js | Descartar |
| Contador de adjuntos | Referencia de migración | No crear archivos ficticios |
| Archivos adjuntos reales | Proveedor de evidencias futuro | Recuperar aparte si están disponibles |

## Principio adoptado

Se recupera **el contenido y conocimiento funcional de Paula**, no la implementación técnica de SharePoint.

De esta manera el trabajo previo sirve como primer catálogo real del producto y como demo para Paula, pero la nueva aplicación mantiene su arquitectura multi-tenant, RLS, auditoría y frontend propio.
