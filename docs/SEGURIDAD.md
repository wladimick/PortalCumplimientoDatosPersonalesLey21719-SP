# Seguridad — TIBOX Compliance

## Objetivo

La aplicación administrará información de cumplimiento y potencialmente evidencias sensibles de múltiples clientes. La seguridad debe diseñarse como parte del producto y no como una capa posterior.

## 1. Activos a proteger

- datos de organizaciones;
- matriz de cumplimiento;
- assessments y hallazgos;
- responsables y usuarios;
- evidencias/documentos;
- integraciones Microsoft 365;
- sesiones y tokens;
- configuración de roles;
- eventos de auditoría;
- secretos de infraestructura.

## 2. Principales amenazas

1. Acceso cruzado entre clientes (IDOR / tenant breakout).
2. Elevación de privilegios manipulando requests.
3. Exposición de `service_role` u otros secretos.
4. Archivos maliciosos o evidencia accesible públicamente.
5. Inyección SQL/XSS o payloads no validados.
6. Robo de sesión.
7. Soporte TIBOX con acceso excesivo o no trazado.
8. Exportaciones masivas sin control.
9. Tokens Microsoft 365 con permisos mayores a los necesarios.
10. Datos sensibles en logs, analytics o errores.

## 3. Controles obligatorios

### 3.1 Multi-tenant

- RLS en toda tabla tenant.
- `organization_id` validado contra memberships.
- Nunca confiar en filtros del frontend.
- Policies probadas con usuarios de distintas organizaciones.
- IDs UUID no sustituyen autorización.

### 3.2 Autenticación

- Supabase Auth.
- Microsoft Entra ID como opción prioritaria a validar.
- MFA disponible/obligatorio para roles privilegiados según decisión.
- sesiones seguras mediante cookies gestionadas por SSR;
- logout e invalidación de sesión;
- invitaciones con expiración.

### 3.3 Autorización

Dos capas:

1. **RBAC de aplicación** para decidir qué acción ofrece/acepta el backend.
2. **RLS PostgreSQL** como barrera de datos.

No usar solamente `role` en el cliente React.

### 3.4 Secretos

- `SUPABASE_SERVICE_ROLE_KEY` solo en runtime servidor.
- No usar secretos en variables `NEXT_PUBLIC_*`.
- Vercel Environment Variables para secretos de aplicación.
- Secretos de Microsoft 365 fuera de tablas visibles al usuario.
- Rotación documentada para credenciales de integración.

### 3.5 Archivos

- buckets privados por defecto;
- rutas que incluyan el tenant de forma controlada;
- descarga mediante autorización y URL firmada de corta duración si se usa Supabase Storage;
- validar tamaño y MIME;
- definir extensiones permitidas;
- no confiar en el nombre del archivo;
- registrar carga/eliminación en auditoría;
- evaluar antivirus/antimalware antes de producción si TIBOX almacena evidencias.

### 3.6 Validación y salida

- Zod en entradas de servidor;
- consultas parametrizadas mediante cliente Supabase;
- React escapa texto por defecto; evitar `dangerouslySetInnerHTML`;
- sanitizar contenido rico si se incorpora;
- límites de longitud;
- protección contra abuso/rate limiting para rutas sensibles.

### 3.7 Cabeceras web

Configurar progresivamente:

- Content-Security-Policy;
- Strict-Transport-Security;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- frame-ancestors según necesidad de embedding.

La CSP debe probarse con Supabase, Vercel y proveedores reales antes de hacerla estricta.

## 4. Acceso TIBOX a datos de clientes

El acceso del personal TIBOX es una decisión sensible.

Propuesta técnica:

- `platform_admin`: acceso global administrativo restringido.
- `platform_support`: no obtiene acceso permanente automático a contenido sensible.
- si soporte necesita entrar al contexto de un cliente, registrar `support_access_started` y `support_access_ended`;
- mostrar visualmente que el usuario está en contexto de soporte;
- auditar operaciones realizadas durante esa sesión;
- evaluar acceso temporal con motivo/ticket obligatorio.

El alcance contractual debe ser definido por Paula/negocio/legal.

## 5. Evidencias en SharePoint

Si se conecta Microsoft 365:

- usar permisos mínimos;
- preferir scopes específicos de sitios cuando sea viable;
- no guardar tokens en navegador;
- registrar organización, tenant Microsoft, sitio y biblioteca autorizados;
- permitir revocación;
- auditar conexiones y desconexiones;
- no asumir que TIBOX debe tener acceso persistente a toda la tenant del cliente.

## 6. Seguridad de base de datos

- RLS enabled + forced policy discipline para tablas expuestas;
- funciones `security definer` solo cuando sean imprescindibles, con `search_path` seguro;
- migraciones versionadas;
- no editar esquema productivo manualmente sin registrar migración;
- backups y PITR según plan contratado de Supabase;
- separar ambientes;
- revisar exposición de vistas y RPCs.

## 7. Auditoría y seguridad

Eventos de seguridad recomendados:

- login fallido/relevante cuando el proveedor lo permita;
- cambio de rol;
- alta/baja de usuario;
- acceso de soporte;
- cambio de proveedor de evidencia;
- conexión/revocación Microsoft 365;
- exportación;
- eliminación de evidencia;
- operación privilegiada;
- errores reiterados de autorización.

No guardar contraseñas, tokens, secretos ni contenido completo de documentos en la bitácora.

## 8. Producción

Antes de producción:

- revisión RLS tabla por tabla;
- pruebas de tenant breakout;
- revisión de dependencias;
- escaneo de secretos;
- pruebas de permisos de roles;
- pruebas de archivos;
- backups/restauración;
- plan de incidentes;
- inventario de datos;
- retención aprobada;
- términos/privacidad aprobados;
- responsable de seguridad definido.

## 9. Criterio de rechazo

No se aprueba una feature si:

- depende solo de ocultar UI;
- usa service role desde el cliente;
- crea una tabla tenant sin RLS;
- crea URLs públicas permanentes de evidencias;
- registra secretos en logs;
- permite que soporte TIBOX acceda silenciosamente a un cliente;
- no deja trazabilidad de cambios sensibles.