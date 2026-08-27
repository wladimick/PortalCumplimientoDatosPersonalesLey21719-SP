# Alta de clientes desde Super Admin

## Objetivo

La operación normal de TIBOX Compliance no debe requerir entrar al SQL Editor para crear un cliente. Los administradores de plataforma pueden realizar el alta desde el espacio interno `TIBOX`.

Ruta:

```text
/app/tibox/administracion
```

## Quién puede crear clientes

Solo `platform_admin`.

Identidades piloto configuradas:

- `wdiaz@tibox.cl` → `platform_admin`
- `pfarias@tibox.cl` → `platform_admin`

Los roles de organización (`org_admin`, `compliance_manager`, `contributor`, `auditor`, `viewer`) no permiten crear organizaciones nuevas.

## Flujo de alta

En **TIBOX → Administración → Nuevo cliente** se solicitan:

1. nombre del cliente;
2. RUT opcional;
3. slug opcional;
4. correo del administrador inicial;
5. rol inicial.

Si el slug se deja vacío, el servidor lo genera desde el nombre.

La Server Action vuelve a validar que el actor sea `platform_admin` y llama a `public.create_customer_org(...)`.

La función PostgreSQL ejecuta en una única transacción:

1. valida actor, nombre, slug, RUT, correo y rol;
2. crea la fila en `organizations`;
3. copia los módulos de `cliente-demo`;
4. copia las obligaciones vinculándolas a los nuevos módulos;
5. copia las categorías del assessment técnico;
6. copia los controles de seguridad vinculándolos a las nuevas categorías;
7. reinicia estados a `pending`;
8. no copia responsables, fechas, notas, acciones ni evidencias;
9. crea `organization_access_grants` para el administrador inicial;
10. registra `organization.created` en `audit_events`;
11. devuelve el resumen de filas creadas.

Si cualquier paso falla, la transacción se revierte y el cliente no queda creado parcialmente.

## Acceso del administrador inicial

El correo autorizado no necesita existir previamente en Supabase Auth.

Cuando la persona usa **Enviar enlace de acceso** en el login, `signInWithOtp` puede crear el usuario Auth. El trigger de identidad crea/actualiza `profiles` y reconcilia las membresías contra `organization_access_grants` activos.

Por lo tanto, el flujo esperado es:

```text
Super Admin crea cliente
        ↓
Grant por correo
        ↓
Usuario recibe/usa magic link
        ↓
Supabase Auth crea identidad
        ↓
Trigger activa membership
        ↓
Cliente aparece en /app
```

## Plantilla base

Por ahora la fuente de plantilla es la organización técnica `cliente-demo`.

Esto permite mantener un catálogo maestro versionado sin copiar estados de trabajo del demo. Antes de eliminar o reutilizar `cliente-demo`, debe implementarse una entidad de plantillas independiente.

## Acceso transversal del Super Admin

Ser `platform_admin` permite crear, listar, administrar accesos y eliminar clientes desde el espacio TIBOX. No convierte automáticamente al Super Admin en miembro de todos los clientes.

Si un Super Admin necesita entrar al dashboard de un cliente, debe asignarse explícitamente un acceso mediante **Agregar acceso**. Esta decisión mantiene separación entre gobierno de plataforma y acceso a datos del cliente.

## Migración

La funcionalidad se agrega mediante:

```text
supabase/migrations/20260826203000_superadmin_client_provisioning.sql
```

Debe ejecutarse después de:

```text
20260826120000_initial_mvp.sql
20260826130000_import_paula_sharepoint_catalog.sql
20260826173000_access_governance_and_client_deletion.sql
```

## Verificación funcional

Usar un cliente de prueba, por ejemplo `Cliente QA`, y comprobar:

1. aparece en Administración;
2. `organizations` contiene una sola fila nueva;
3. tiene los mismos módulos base que `cliente-demo`;
4. tiene las obligaciones base con estado `pending`;
5. tiene categorías y controles técnicos con estado `pending`;
6. no contiene evidencias ni acciones heredadas;
7. existe un grant activo para el administrador inicial;
8. el correo autorizado puede autenticarse por magic link y obtiene solo ese cliente;
9. un usuario sin grant no puede abrir el cliente modificando la URL.
