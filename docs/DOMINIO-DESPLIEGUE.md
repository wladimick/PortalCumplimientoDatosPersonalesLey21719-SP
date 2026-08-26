# Dominio, ambientes y despliegue

## Dominio propuesto

Producción:

```text
https://cumplimiento.tibox.cl
```

El nombre comercial del producto puede cambiar sin obligar a cambiar el dominio técnico inicialmente.

## DNS

Flujo previsto:

1. crear proyecto Vercel;
2. agregar `cumplimiento.tibox.cl` como dominio;
3. Vercel indicará el registro DNS requerido;
4. configurar el registro en el proveedor DNS de `tibox.cl`;
5. validar dominio;
6. verificar HTTPS/certificado;
7. probar redirecciones y canonical host.

No hardcodear el target DNS de Vercel en documentación porque puede variar según la configuración indicada por Vercel.

## Ambientes

### Local

```text
http://localhost:3000
```

- desarrollo;
- Supabase local o proyecto dev;
- datos ficticios;
- nunca secretos productivos.

### Preview

Vercel Preview por Pull Request.

- QA funcional;
- base dev/staging;
- no usar service keys de producción;
- previews no deben apuntar accidentalmente a producción.

### Production

```text
https://cumplimiento.tibox.cl
```

- rama `main`;
- Supabase producción;
- secretos producción;
- observabilidad y backups activos.

## Git flow propuesto

```text
feature/*
   │
   ▼
Pull Request
   │
   ├─ lint
   ├─ typecheck
   ├─ tests
   ├─ build
   └─ Vercel Preview
   │
   ▼
main
   │
   ▼
Production
```

No desarrollar directamente sobre `main` salvo correcciones excepcionales controladas.

## Variables de entorno

Separar públicas y privadas.

Públicas esperadas:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Privadas potenciales:

```text
SUPABASE_SERVICE_ROLE_KEY
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_TENANT_MODE
AUDIT_SIGNING_SECRET (solo si se adopta)
```

La lista final depende de decisiones de autenticación e integración.

## Regla de secretos

- `.env.local` no se versiona;
- `.env.example` contiene nombres, nunca valores reales;
- secretos productivos se configuran en Vercel/Supabase;
- rotar si existe sospecha de exposición;
- evitar copiarlos a tickets, commits o logs.

## Supabase

Propuesta:

- proyecto `dev/staging`;
- proyecto `production`;
- migraciones SQL versionadas en Git;
- cambios de esquema por migración;
- seed solo con datos no sensibles.

## Migraciones

Flujo:

1. crear migración;
2. probar local/dev;
3. revisar RLS;
4. aplicar en staging;
5. QA;
6. aplicar producción mediante proceso controlado.

Migraciones destructivas requieren estrategia de rollback/compatibilidad.

## Checks de CI

Mínimo antes de merge:

- `npm run lint`;
- `npm run typecheck`;
- `npm run test` cuando existan pruebas;
- `npm run build`;
- scanner de secretos;
- tests de RLS en cambios de base de datos.

## Headers y seguridad

La configuración de producción debe añadir headers de seguridad y HTTPS. CSP se activará en modo report/evaluación primero si las integraciones requieren ajuste.

## Observabilidad

Separar:

- errores frontend/server;
- métricas operativas;
- auditoría de negocio;
- eventos de seguridad.

Los logs técnicos no deben incluir secretos ni evidencias.

## Rollback

Frontend:

- rollback a deployment Vercel anterior.

Base de datos:

- no confiar en rollback automático de SQL;
- preferir migraciones compatibles hacia adelante;
- documentar scripts de corrección cuando proceda.

## Disponibilidad

SLA, horario de soporte, RTO y RPO son decisiones de servicio y deben responderse antes de comprometerlos comercialmente.