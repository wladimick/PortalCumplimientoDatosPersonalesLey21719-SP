# Arquitectura del Portal de Cumplimiento

## 1. Principio de diseño

La solución se divide en tres capas:

1. **Presentación**: un frontend autocontenido en HTML/CSS/JavaScript.
2. **Datos**: listas nativas de SharePoint Online.
3. **Seguridad**: permisos y sesión nativa de Microsoft 365/SharePoint.

El objetivo del MVP es que el portal pueda copiarse entre sitios sin cambiar URLs, credenciales o IDs específicos del tenant.

## 2. Arquitectura lógica

```text
┌───────────────────────────────────────────┐
│ Página clásica SharePoint                 │
│                                           │
│  Script Editor Web Part                   │
│  ┌─────────────────────────────────────┐  │
│  │ portal.html                         │  │
│  │                                     │  │
│  │ UI                                  │  │
│  │ Data Adapter                        │  │
│  │ SharePoint REST Client              │  │
│  └─────────────────────────────────────┘  │
└─────────────────┬─────────────────────────┘
                  │ same-origin REST
                  ▼
┌───────────────────────────────────────────┐
│ SharePoint REST API                       │
│ /_api/web                                 │
│ /_api/web/lists                          │
└─────────────────┬─────────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────────┐
│ Listas del sitio                          │
│ - Módulos del Portal                      │
│ - Matriz de Cumplimiento                  │
│ - Assessment de Seguridad                 │
│ - Categorías de Seguridad                 │
│ - Resumen Ejecutivo                       │
└───────────────────────────────────────────┘
```

## 3. Portabilidad

El portal no debe contener valores como:

```text
https://cliente.sharepoint.com/sites/PortalCumplimiento
```

En su lugar obtiene el contexto desde SharePoint:

```javascript
_spPageContextInfo.webAbsoluteUrl
```

Si el objeto no estuviera disponible, se utiliza la URL actual como fallback.

Esto permite reutilizar exactamente el mismo archivo en diferentes sitios y tenants.

## 4. Descubrimiento de listas

El frontend consulta primero:

```text
/_api/web/lists
```

Luego compara los títulos encontrados contra aliases configurados.

Ejemplo:

```javascript
modules: [
  "Módulos del Portal",
  "Modulos del Portal"
]
```

Una vez localizada una lista se utiliza su GUID para las consultas posteriores. Esto evita depender de caracteres especiales o espacios en la URL.

## 5. Descubrimiento de columnas

No se deben hardcodear nombres internos generados por SharePoint, por ejemplo:

```text
Descripci_x00f3_n
```

El portal consulta los metadatos de campos de cada lista y construye un mapa:

```text
Nombre visible -> InternalName
```

Después resuelve cada dato usando un conjunto de aliases funcionales.

Ejemplo conceptual:

```javascript
status: ["Estado", "Status"]
responsible: ["Responsable", "Responsible"]
module: ["ModuloPortal", "Módulo", "Modulo"]
```

Esto hace la solución más tolerante a listas creadas manualmente.

## 6. FieldValuesAsText

Para mostrar datos se prioriza `FieldValuesAsText` de SharePoint REST.

Esto ayuda especialmente con:

- Persona o grupo;
- Lookup;
- Choice;
- Fechas;
- valores formateados.

De esta forma, el frontend puede mostrar el texto que SharePoint ya preparó sin conocer todos los tipos de columna de antemano.

## 7. Módulos funcionales

El modelo base considera nueve módulos:

1. Información y transparencia.
2. Derechos de titulares.
3. Seguridad y confidencialidad.
4. Incidentes y vulneraciones.
5. Privacidad desde el diseño.
6. Terceros y encargados.
7. Evaluaciones de impacto.
8. Prevención y cumplimiento.
9. Seguridad de infraestructura y aplicaciones.

Si la lista `Módulos del Portal` está disponible, sus registros reemplazan/complementan el catálogo visual por defecto.

## 8. Matriz de Cumplimiento

La matriz es la fuente principal de obligaciones.

El portal intenta resolver, entre otros:

- obligación/título;
- módulo;
- descripción;
- artículo o referencia legal;
- estado;
- responsable;
- fecha;
- observaciones;
- adjuntos/evidencias.

La primera versión es principalmente de lectura y deriva al formulario nativo de SharePoint para edición.

## 9. Assessment de Seguridad

La vista técnica usa la lista `Assessment de Seguridad` y puede mostrar:

- Control de seguridad;
- Categoría;
- Descripción del control;
- Nivel;
- Estado;
- Recomendación;
- Responsable;
- Fecha de revisión;
- Observaciones;
- Evidencias/adjuntos;
- Módulo del portal.

Los elementos se agrupan visualmente por categoría cuando hay información suficiente.

## 10. Dashboard

Si existe información utilizable en `Matriz de Cumplimiento`, el portal calcula indicadores básicos:

- total de obligaciones;
- cumplidas;
- en proceso;
- pendientes;
- porcentaje de avance.

La lista `Resumen Ejecutivo` queda disponible para una futura versión donde ciertos indicadores sean definidos explícitamente por negocio.

## 11. Evidencias

### MVP

Los adjuntos existentes se consultan mediante SharePoint REST y se muestran en el portal. La edición y carga puede derivar inicialmente al formulario nativo de SharePoint.

### Siguiente fase

Agregar carga directa desde el frontend mediante:

```text
/_api/web/lists(...)/items(ID)/AttachmentFiles/add(...)
```

La operación deberá utilizar el `RequestDigest` de SharePoint y validar permisos/errores.

Para grandes volúmenes o requisitos documentales avanzados se evaluará migrar evidencias desde adjuntos de lista hacia una **biblioteca de documentos** relacionada por ID de obligación.

## 12. Seguridad

Las peticiones se realizan con:

```javascript
credentials: "same-origin"
```

No se incluye:

- client secret;
- access token persistido;
- usuario/contraseña;
- app registration dentro del HTML.

El código corre con el contexto del usuario conectado. Por lo tanto, nunca debe considerarse una capa de autorización independiente: SharePoint continúa siendo la autoridad de permisos.

## 13. Modo clásico vs. SPFx

### MVP clásico

Ventajas:

- despliegue muy rápido;
- un solo archivo;
- fácil de probar y ajustar;
- no requiere App Catalog ni toolchain Node.js.

Desventajas:

- depende de custom script;
- solo puede insertarse directamente en páginas clásicas;
- menor gobernanza que SPFx;
- custom script se habilita temporalmente en SharePoint Online.

### Evolución SPFx

La versión SPFx debe reutilizar:

- diseño visual;
- normalización de datos;
- aliases de listas/campos;
- lógica de dashboard;
- modelo de navegación.

La capa REST podrá reemplazarse gradualmente por `SPHttpClient` sin cambiar el modelo funcional.

## 14. Provisioning futuro

El instalador deberá ser idempotente.

Es decir, ejecutarlo dos veces no debería duplicar listas ni datos. Debe:

1. detectar el sitio;
2. validar si cada lista existe;
3. crear solo recursos faltantes;
4. validar columnas por `InternalName`/Title;
5. crear o actualizar datos base;
6. crear/actualizar la página;
7. instalar el frontend;
8. ejecutar pruebas básicas de REST;
9. devolver un informe final.

## 15. Estructura futura propuesta

```text
/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── DATA-MODEL.md
│   └── CHANGELOG.md
├── portal/
│   └── portal.html
├── provisioning/
│   ├── Install-PortalCumplimiento.ps1
│   ├── Update-PortalCumplimiento.ps1
│   └── data/
│       ├── modules.json
│       └── security-controls.json
└── spfx/                       # fase posterior
```
