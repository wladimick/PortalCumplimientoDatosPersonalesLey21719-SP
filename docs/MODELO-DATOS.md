# Modelo de datos — propuesta inicial

## Convenciones

- IDs: UUID.
- Fechas: `timestamptz` en UTC.
- Cada tabla de cliente incluye `organization_id` salvo que sea catálogo global.
- Catálogos usan claves técnicas estables (`key`) separadas del texto visible.
- Soft delete solo donde tenga sentido; auditoría no se reutiliza como papelera.
- Toda relación importante usa foreign keys.

## Núcleo de identidad

### `organizations`

Representa un cliente/tenant lógico.

Campos sugeridos:

- `id`
- `name`
- `slug`
- `rut`
- `status`
- `plan`
- `evidence_provider`
- `created_at`
- `updated_at`

### `profiles`

Perfil de usuario asociado al `auth.users.id` de Supabase.

- `id` = auth user id
- `display_name`
- `email_snapshot`
- `avatar_url`
- `created_at`
- `updated_at`

No guardar credenciales.

### `organization_memberships`

Relación usuario ↔ organización.

- `id`
- `organization_id`
- `user_id`
- `role`
- `status`
- `invited_by`
- `created_at`

Constraint único: `(organization_id, user_id)`.

### `platform_memberships`

Roles internos TIBOX separados de los del cliente.

- `user_id`
- `role`: `platform_admin` / `platform_support`
- `status`

## Catálogo de cumplimiento

### `frameworks`

Ejemplo: `ley-21719`.

- `id`
- `key`
- `name`
- `version`
- `description`
- `active`

### `framework_modules`

Módulos globales reutilizables.

- `id`
- `framework_id`
- `key`
- `name`
- `description`
- `legal_reference`
- `sort_order`

### `control_templates`

Definición maestra de obligación/control.

- `id`
- `framework_module_id`
- `key`
- `title`
- `description`
- `legal_reference`
- `control_type`
- `default_priority`
- `sort_order`
- `active`

No contiene estado de un cliente.

## Estado por cliente

### `organization_frameworks`

Activa un marco para un cliente.

- `id`
- `organization_id`
- `framework_id`
- `status`
- `started_at`
- `target_date`

### `control_instances`

Instancia de un control/obligación para una organización.

- `id`
- `organization_id`
- `organization_framework_id`
- `control_template_id`
- `status`
- `priority`
- `owner_membership_id`
- `reviewer_membership_id`
- `due_date`
- `last_reviewed_at`
- `notes`
- `created_at`
- `updated_at`

Constraint recomendado: una instancia activa por combinación organización + marco + template.

### `control_reviews`

Historial de revisiones formales.

- `id`
- `organization_id`
- `control_instance_id`
- `result`
- `comment`
- `reviewed_by`
- `reviewed_at`

## Assessment técnico

Puede reutilizar `frameworks/control_templates` con `control_type = security`, evitando crear un segundo motor. Si el flujo requiere atributos específicos, agregar:

### `security_assessment_details`

- `control_instance_id`
- `category_key`
- `maturity_level`
- `risk_level`
- `recommendation`

Esta separación evita duplicar identidad, responsables, evidencias y auditoría.

## Plan de acción

### `action_items`

- `id`
- `organization_id`
- `control_instance_id` opcional
- `title`
- `description`
- `status`
- `priority`
- `owner_membership_id`
- `due_date`
- `completed_at`
- `created_by`
- `created_at`
- `updated_at`

## Evidencias

### `evidence_items`

Metadata independiente del proveedor físico.

- `id`
- `organization_id`
- `control_instance_id`
- `provider`: `supabase` / `sharepoint`
- `provider_object_id`
- `file_name`
- `mime_type`
- `size_bytes`
- `checksum`
- `evidence_type`
- `valid_from`
- `valid_until`
- `uploaded_by`
- `created_at`
- `deleted_at`

Nunca guardar una URL pública permanente para evidencia privada.

## Comentarios

### `comments`

- `id`
- `organization_id`
- `entity_type`
- `entity_id`
- `body`
- `created_by`
- `created_at`
- `edited_at`

Si se permite edición/eliminación, debe quedar registrada en auditoría.

## Integraciones

### `integrations`

- `id`
- `organization_id`
- `provider`
- `status`
- `config` JSONB sin secretos sensibles en texto plano
- `connected_by`
- `connected_at`
- `last_sync_at`

Tokens/secretos deben almacenarse mediante mecanismo seguro apropiado, nunca en columnas accesibles al frontend.

## Auditoría

### `audit_events`

- `id`
- `organization_id` nullable para eventos de plataforma
- `actor_user_id`
- `actor_type`
- `action`
- `entity_type`
- `entity_id`
- `request_id`
- `summary`
- `before_data` JSONB sanitizado opcional
- `after_data` JSONB sanitizado opcional
- `metadata` JSONB sanitizado
- `created_at`

No permitir UPDATE/DELETE a usuarios de aplicación.

## Configuración

### `organization_settings`

- `organization_id`
- `branding` JSONB limitado
- `notifications` JSONB
- `locale`
- `timezone`
- `evidence_provider`

Se debe evitar convertir esta tabla en un JSON genérico para lógica crítica. Las decisiones estructurales deben tener columnas/tipos explícitos.

## Relaciones principales

```text
organizations
 ├─ organization_memberships ─ profiles
 ├─ organization_frameworks ─ frameworks
 │    └─ control_instances ─ control_templates
 │          ├─ control_reviews
 │          ├─ action_items
 │          ├─ evidence_items
 │          └─ comments
 ├─ integrations
 ├─ organization_settings
 └─ audit_events
```

## Índices mínimos

- todas las FK;
- `organization_id` en tablas tenant;
- `(organization_id, status)` en controles y acciones;
- `(organization_id, due_date)`;
- `(organization_id, created_at desc)` para auditoría;
- índices únicos para `slug`, claves de catálogo y memberships.

## Regla crítica

El modelo final debe revisarse junto con las políticas RLS. Una tabla tenant nueva **no se considera terminada** hasta tener:

1. `organization_id` o justificación para no tenerlo;
2. FK;
3. RLS habilitado;
4. políticas de SELECT/INSERT/UPDATE/DELETE;
5. evento de auditoría si la operación es sensible;
6. estrategia de exportación y borrado.