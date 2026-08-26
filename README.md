# Portal de Cumplimiento de Protección de Datos Personales — Ley N° 21.719

Portal autocontenido para **SharePoint Online** orientado a gestionar obligaciones, controles, estados y evidencias asociadas al cumplimiento de la Ley N° 21.719.

La primera versión está pensada para poder instalarse rápidamente en un sitio SharePoint existente mediante una **página clásica + Script Editor Web Part**, sin requerir SPFx ni un servicio externo. El portal consume las listas del **mismo sitio** mediante SharePoint REST API y utiliza la identidad/permisos del usuario conectado.

> **Importante:** esta arquitectura es deliberadamente una solución de despliegue rápido. Microsoft recomienda SPFx para personalizaciones modernas. El proyecto contempla una evolución futura a SPFx manteniendo el mismo modelo de datos.

## Objetivos del proyecto

- Portal visual y simple, inspirado en una aplicación y no en una lista tradicional de SharePoint.
- Funcionar en distintos tenants y sitios sin URLs hardcodeadas.
- Leer datos desde listas SharePoint del sitio actual.
- Mantener la seguridad nativa de SharePoint: el usuario solo puede leer/modificar lo que sus permisos permiten.
- Permitir una instalación manual inicial y posteriormente una instalación automatizada con PowerShell/PnP PowerShell.
- Mantener HTML, CSS y JavaScript en un único archivo para la modalidad clásica.
- Preparar la estructura para una futura versión SPFx.

## Arquitectura MVP

```text
SharePoint Online
└── Sitio de cumplimiento
    ├── Página clásica
    │   └── Script Editor Web Part
    │       └── portal/portal.html
    │
    ├── Módulos del Portal
    ├── Matriz de Cumplimiento
    ├── Assessment de Seguridad
    ├── Categorías de Seguridad
    └── Resumen Ejecutivo

portal.html
└── SharePoint REST API
    └── /_api/web/...
```

El archivo `portal/portal.html` detecta automáticamente la URL del sitio actual y no necesita conocer el tenant de antemano.

## Listas esperadas

El MVP reconoce las siguientes listas por nombre:

| Lista | Uso |
|---|---|
| `Módulos del Portal` | Menú y definición de los módulos de cumplimiento. |
| `Matriz de Cumplimiento` | Obligaciones, estado, responsable y evidencias. |
| `Assessment de Seguridad` | Controles técnicos agrupados por categoría. |
| `Categorías de Seguridad` | Catálogo de categorías del assessment. |
| `Resumen Ejecutivo` | Indicadores o valores ejecutivos opcionales. |

El portal también incorpora aliases sin tilde para facilitar instalaciones en distintos sitios.

## Estado actual

### v0.1 — MVP clásico

- [x] Repositorio inicial.
- [x] Arquitectura documentada.
- [x] Instalación manual documentada.
- [x] Portal HTML/CSS/JS autocontenido.
- [x] Conexión dinámica al sitio actual.
- [x] Lectura de listas por SharePoint REST API.
- [x] Dashboard ejecutivo calculado desde la matriz.
- [x] Navegación por módulos.
- [x] Vista especial para Assessment de Seguridad.
- [x] Diagnóstico de listas faltantes.
- [ ] Edición inline de estados y responsables.
- [ ] Carga de evidencias dentro del portal mediante REST.
- [ ] Instalador PowerShell/PnP PowerShell.
- [ ] Creación automática de listas, columnas y datos base.
- [ ] Creación automática de página clásica y Script Editor Web Part.
- [ ] Versión SPFx para páginas modernas.

## Instalación rápida

1. Selecciona un sitio SharePoint Online existente.
2. Habilita temporalmente **Scripts personalizados** para ese sitio desde el Centro de administración de SharePoint.
3. Crea una página clásica de tipo Wiki/Web Part Page.
4. Agrega un **Script Editor Web Part**.
5. Copia el contenido completo de `portal/portal.html` dentro del editor de scripts.
6. Verifica que las listas esperadas existan en el mismo sitio.
7. Publica la página.

Consulta el procedimiento detallado en [`docs/INSTALLATION.md`](docs/INSTALLATION.md).

## Diseño

El portal usa una interfaz propia con:

- cabecera tipo aplicación;
- menú lateral por módulos;
- resumen ejecutivo;
- tarjetas de navegación;
- tablas compactas de obligaciones;
- vista agrupada de controles técnicos;
- badges de estado y criticidad;
- diseño responsive;
- enlaces a los formularios nativos de SharePoint para mantener compatibilidad en el MVP.

## Compatibilidad y limitaciones

### Compatible en el MVP

- SharePoint Online.
- Sitios clásicos.
- Sitios modernos/Teams donde se cree una **página clásica** y se permita custom script para insertar el Script Editor.
- Navegadores modernos.

### No compatible directamente

- Página moderna estándar con HTML/JavaScript pegado directamente.
- Sitio personal de OneDrive.

Para una página moderna, la evolución recomendada es empaquetar el mismo frontend como **SPFx Web Part**.

## Seguridad

El portal no almacena credenciales ni tokens. Las llamadas REST se realizan contra el sitio actual usando la sesión de Microsoft 365 del usuario.

Por lo tanto:

- no se elevan permisos;
- no se expone información que el usuario no pueda consultar en SharePoint;
- cualquier futura operación de escritura respetará los permisos de las listas;
- se recomienda limitar quién puede editar la página que contiene el Script Editor.

## Estructura del repositorio

```text
/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── INSTALLATION.md
└── portal/
    └── portal.html
```

La futura automatización agregará una carpeta `provisioning/` con scripts PowerShell y definición del modelo de listas.

## Roadmap propuesto

**Fase 1 — Portal clásico funcional**  
HTML autocontenido, lectura REST, navegación y visualización.

**Fase 2 — Operación desde el portal**  
Actualizar estados, responsables, observaciones y adjuntar evidencias sin salir de la interfaz.

**Fase 3 — Provisioning**  
Script PowerShell/PnP PowerShell que crea listas, columnas, datos base, página y configuración.

**Fase 4 — SPFx**  
Versión soportada para páginas modernas reutilizando el modelo y diseño del portal.

## Autoría

Proyecto mantenido en el repositorio `wladimick/PortalCumplimientoDatosPersonalesLey21719-SP`.
