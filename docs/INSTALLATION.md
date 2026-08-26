# Instalación manual del Portal de Cumplimiento

Este documento describe la instalación inicial del portal en SharePoint Online usando una **página clásica** con **Script Editor Web Part**.

## 1. Requisitos

- Ser administrador de SharePoint o contar con apoyo de un administrador para habilitar scripts personalizados en el sitio.
- Tener permisos de propietario del sitio.
- Contar con las listas de datos en el mismo sitio donde se instalará el portal.
- Utilizar una página clásica. Las páginas modernas no permiten insertar directamente JavaScript arbitrario con los web parts estándar.

## 2. Sitios compatibles

El MVP puede instalarse en:

- un sitio clásico existente;
- un sitio de equipo moderno;
- un sitio creado desde Microsoft Teams, siempre que el portal se aloje en una página clásica dentro del sitio de SharePoint asociado;
- otros sitios SharePoint Online donde sea posible crear/usar una página clásica y habilitar custom script.

No debe considerarse como destino un sitio personal de OneDrive.

## 3. Habilitar temporalmente Scripts personalizados

### Opción A — Centro de administración de SharePoint

1. Abre el **Centro de administración de SharePoint**.
2. Ve a **Sitios > Sitios activos**.
3. Selecciona el sitio donde se instalará el portal.
4. Abre **Configuración**.
5. Entra a **Scripts personalizados**.
6. Selecciona **Permitido**.
7. Guarda los cambios.

SharePoint Online revierte normalmente esta autorización a **Bloqueado** en un plazo máximo aproximado de 24 horas. Por eso conviene realizar la instalación y las modificaciones del Script Editor durante la ventana habilitada.

### Opción B — SharePoint Online Management Shell

```powershell
Set-SPOSite -Identity "https://TENANT.sharepoint.com/sites/SITIO" -DenyAddAndCustomizePages 0
```

### Opción C — PnP PowerShell

```powershell
Connect-PnPOnline -Url "https://TENANT.sharepoint.com/sites/SITIO" -Interactive
Set-PnPSite -Identity "https://TENANT.sharepoint.com/sites/SITIO" -NoScriptSite $false
```

## 4. Verificar las listas

El portal busca las listas en el **sitio actual**. No hay URLs de tenant configuradas en el HTML.

Listas base:

1. `Módulos del Portal`
2. `Matriz de Cumplimiento`
3. `Assessment de Seguridad`
4. `Categorías de Seguridad`
5. `Resumen Ejecutivo`

El HTML incorpora aliases sin tilde para algunos nombres, pero se recomienda mantener los nombres anteriores como estándar del proyecto.

## 5. Crear la página clásica

La forma exacta de crear una página clásica puede variar según el tipo de sitio y la configuración del tenant. El objetivo es disponer de una página donde SharePoint permita agregar un **Script Editor Web Part**.

Una configuración recomendada es:

- Biblioteca: `Páginas del sitio` / `Site Pages`.
- Nombre sugerido: `PortalCumplimiento.aspx`.
- Tipo: Wiki Page o Web Part Page clásica.

Si el sitio no expone la opción desde la interfaz, la futura automatización del proyecto creará la página mediante PowerShell/PnP.

## 6. Agregar el Script Editor Web Part

1. Edita la página clásica.
2. Selecciona **Agregar un elemento web**.
3. Busca la categoría **Medios y contenido**.
4. Agrega **Editor de scripts / Script Editor**.
5. Edita el fragmento del web part.
6. Copia **todo** el contenido de:

```text
portal/portal.html
```

7. Guarda el fragmento.
8. Guarda/publica la página.

## 7. Primera carga

Al abrir la página, el portal:

1. detecta automáticamente la URL absoluta del sitio actual;
2. consulta `/_api/web` para obtener información del sitio;
3. consulta las listas disponibles;
4. identifica las listas del portal por nombre;
5. obtiene sus columnas y elementos;
6. construye la navegación y el dashboard;
7. muestra un diagnóstico si falta alguna lista.

No es necesario cambiar la URL del tenant dentro del código.

## 8. Uso en varios clientes o tenants

Para reutilizar el portal:

1. crea o reutiliza un sitio SharePoint del cliente;
2. crea las listas con el modelo estándar;
3. habilita temporalmente custom script;
4. crea la página clásica;
5. pega el mismo `portal.html`;
6. publica.

El mismo archivo puede utilizarse en distintos tenants porque trabaja con rutas relativas al sitio actual y con la sesión del usuario conectado.

## 9. Permisos

El portal no reemplaza el modelo de permisos de SharePoint.

Ejemplo recomendado:

- **Propietarios del portal**: Control total.
- **Responsables de cumplimiento**: Editar/Contribuir en las listas correspondientes.
- **Lectores / Dirección**: Lectura.
- **Evidencias sensibles**: considerar una biblioteca o lista con permisos específicos si el alcance lo requiere.

El frontend solo podrá leer o modificar aquello que el usuario conectado ya tenga permitido en SharePoint.

## 10. Diagnóstico de problemas

### No aparece el Script Editor

Verifica que:

- la página sea clásica;
- custom script esté temporalmente permitido;
- el usuario tenga permisos suficientes para personalizar la página.

### El portal carga pero indica listas faltantes

Revisa **Contenido del sitio** y confirma los nombres de las listas.

### Una columna no aparece correctamente

El portal resuelve columnas usando el nombre visible y el nombre interno. Si una instalación utiliza nombres totalmente diferentes, deben agregarse aliases en la configuración del archivo `portal.html`.

### El portal muestra acceso denegado

La llamada REST utiliza los permisos del usuario actual. Verifica permisos sobre el sitio y las listas.

## 11. Recomendación para producción

El MVP clásico permite desplegar rápido y validar la solución con usuarios reales. Para una solución de largo plazo se recomienda evolucionar a **SharePoint Framework (SPFx)**, especialmente para páginas modernas, manteniendo las mismas listas y reglas de negocio.

## 12. Próxima automatización

El roadmap contempla un script similar a:

```powershell
./Install-PortalCumplimiento.ps1 `
  -SiteUrl "https://TENANT.sharepoint.com/sites/Cumplimiento" `
  -PortalPageName "PortalCumplimiento.aspx"
```

La futura automatización deberá:

- conectarse al tenant;
- validar permisos;
- habilitar temporalmente custom script cuando corresponda;
- crear/actualizar las listas;
- crear columnas;
- cargar catálogos iniciales;
- crear la página clásica;
- insertar el HTML;
- validar la instalación;
- entregar un resumen final de recursos creados.
