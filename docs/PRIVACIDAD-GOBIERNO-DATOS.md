# Privacidad y gobierno de datos

## Objetivo

Definir cómo clasificar, almacenar, acceder, exportar y eliminar información de clientes antes de implementar flujos que manejen datos sensibles.

## Clasificación inicial

### Datos de plataforma

- configuración técnica;
- catálogos de marcos;
- features flags;
- métricas agregadas no identificables.

### Datos del cliente

- nombre/RUT de organización;
- usuarios y roles;
- obligaciones y estados;
- responsables;
- observaciones;
- assessments;
- planes de acción.

### Datos sensibles / evidencia

- documentos de cumplimiento;
- políticas internas;
- registros;
- informes;
- archivos que puedan contener datos personales o información confidencial.

La aplicación no debe asumir que una evidencia es inocua por su nombre o tipo.

## Principios

1. Minimización: guardar solo lo necesario.
2. Propósito: cada dato debe tener uso definido.
3. Segregación: todo dato de cliente pertenece a una organización.
4. Privacidad por defecto: evidencias privadas.
5. Trazabilidad: acceso/modificación sensible auditable.
6. Portabilidad: el cliente debe poder obtener su información al finalizar el servicio según contrato.
7. Borrado controlado: definir qué se elimina, anonimiza o retiene.

## Responsabilidad de datos

Pendiente de validación contractual:

- rol de TIBOX respecto de los datos del cliente;
- quién define finalidades y medios;
- condiciones para soporte;
- subencargados tecnológicos;
- transferencias internacionales aplicables;
- ubicación/región de infraestructura;
- política de retención.

Estas definiciones no deben inferirse únicamente de la arquitectura técnica.

## Evidencias

Se contemplan dos modelos:

### A. Supabase Storage

Ventajas:

- implementación centralizada;
- experiencia consistente;
- control directo desde TIBOX Compliance.

Implicancias:

- TIBOX aloja los archivos en la infraestructura seleccionada;
- se requiere política de retención y backup;
- se debe evaluar malware scanning;
- contrato y privacidad deben reflejarlo.

### B. SharePoint del cliente

Ventajas:

- evidencia permanece en Microsoft 365 del cliente;
- se aprovechan gobierno, permisos y versionado del cliente.

Implicancias:

- consentimiento/configuración Microsoft 365;
- dependencia de Graph/tenant del cliente;
- permisos y tokens;
- soporte más complejo.

La aplicación debe abstraer ambos proveedores.

## Exportación y término de servicio

Definir un procedimiento por organización:

1. bloquear nuevas modificaciones;
2. generar exportación estructurada;
3. entregar evidencias o referencias según proveedor;
4. revocar integraciones;
5. deshabilitar usuarios;
6. ejecutar retención/borrado según contrato;
7. registrar cierre en auditoría.

## Logs

No registrar:

- passwords;
- access/refresh tokens;
- service role keys;
- contenido de archivos;
- formularios completos si contienen información sensible;
- PII innecesaria.

## Analytics

Antes de incorporar analytics de terceros, definir:

- qué eventos se capturan;
- si contienen identificadores de cliente/usuario;
- consentimiento necesario;
- retención;
- acceso interno.

Por defecto, preferir métricas operativas con datos mínimos.

## Backups

Los backups deben respetar la misma clasificación que la fuente. El borrado contractual debe considerar ventanas de backup y restauración.

## Decisiones pendientes

Las preguntas de negocio y política están en [`DECISIONES-PAULA.md`](DECISIONES-PAULA.md).