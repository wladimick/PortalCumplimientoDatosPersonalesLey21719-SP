# Roles y permisos

## Modelo

La autorización se divide en dos dominios independientes:

1. roles de plataforma TIBOX;
2. roles dentro de una organización cliente.

Una misma persona puede tener ambos tipos, pero nunca deben inferirse entre sí.

## Roles de plataforma

### `platform_admin`

Uso restringido a administradores designados de TIBOX.

Puede:

- crear/desactivar organizaciones;
- administrar catálogo maestro;
- gestionar configuración de plataforma;
- gestionar memberships TIBOX;
- revisar auditoría global;
- entrar a contexto de cliente cuando el modelo comercial/legal lo permita.

### `platform_support`

Puede:

- ver estado operativo mínimo de clientes;
- revisar errores técnicos e integraciones;
- solicitar/iniciar acceso de soporte según política;
- no debe modificar roles de plataforma ni acceder silenciosamente a evidencias.

## Roles de organización

### `org_admin`

- administrar usuarios de su organización;
- configurar organización;
- ver y editar cumplimiento;
- asignar responsables;
- administrar evidencias según política;
- generar reportes;
- ver auditoría de su organización.

### `compliance_manager`

- administrar matriz;
- cambiar estados;
- asignar responsables;
- crear acciones;
- gestionar evidencias;
- revisar progreso;
- generar reportes.

### `contributor`

- ver controles permitidos;
- actualizar controles asignados o permitidos;
- adjuntar evidencia;
- actualizar acciones propias/asignadas;
- comentar.

### `auditor`

- lectura amplia de cumplimiento;
- realizar revisiones;
- agregar observaciones;
- no administrar usuarios ni configuración.

### `viewer`

- lectura;
- reportes permitidos;
- sin escritura.

## Matriz inicial

| Acción | Platform admin | Support | Org admin | Compliance | Contributor | Auditor | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ver dashboard cliente | Sí | Condicional | Sí | Sí | Sí | Sí | Sí |
| Editar control | Condicional | No | Sí | Sí | Limitado | No | No |
| Subir evidencia | Condicional | No | Sí | Sí | Sí | No | No |
| Eliminar evidencia | Condicional | No | Sí | Condicional | Propia/condicional | No | No |
| Crear acción | Condicional | No | Sí | Sí | Sí | Sí/observación | No |
| Administrar usuarios cliente | Sí | No | Sí | No | No | No | No |
| Ver auditoría cliente | Sí | Soporte autorizado | Sí | Sí/limitado | No | Sí | No |
| Exportar datos | Sí | No | Sí | Sí | No | Sí/limitado | Limitado |
| Configurar integración | Sí | Soporte autorizado | Sí | No | No | No | No |
| Administrar organizaciones | Sí | No | No | No | No | No | No |

`Condicional` requiere definición de producto/contrato.

## Reglas de implementación

### Frontend

El frontend puede usar permisos calculados para experiencia de usuario:

```ts
can("evidence.create")
can("organization.members.manage")
```

Pero esos checks no son barrera de seguridad.

### Servidor

Cada mutación valida:

1. sesión;
2. organización activa;
3. membership activa;
4. permiso requerido;
5. pertenencia del recurso a la organización;
6. payload;
7. auditoría si corresponde.

### Base de datos

RLS limita filas accesibles. Para operaciones especialmente sensibles, usar RPC/funciones controladas o servidor con validación explícita.

## Contexto de organización

El cliente puede seleccionar organización si pertenece a más de una.

Una ruta como:

```text
/o/prodata/controles/123
```

es solo contexto UX. El slug o ID de URL jamás autoriza por sí mismo.

## Cambios de roles

Todo cambio debe registrar:

- actor;
- usuario afectado;
- organización;
- rol anterior;
- rol nuevo;
- fecha;
- motivo opcional/obligatorio según política.

## Acceso de soporte

Propuesta recomendada:

1. soporte abre organización;
2. sistema solicita motivo/ticket;
3. se registra inicio;
4. UI muestra banner persistente de modo soporte;
5. cada mutación queda asociada al actor real;
6. se registra fin.

Queda pendiente decidir si además se requiere aprobación del cliente.