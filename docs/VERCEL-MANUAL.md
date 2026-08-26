# Vercel — configuración del MVP

Proyecto Vercel asociado al repositorio:

```text
tibox-app / tiboxcompliance
```

## Variables requeridas

En Vercel:

```text
Project
→ Settings
→ Environment Variables
```

Agregar:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
```

Aplicar las tres a:

- Production
- Preview
- Development

Para el piloto, `NEXT_PUBLIC_APP_URL` puede comenzar con el dominio estable de Vercel y cambiar después a `https://cumplimiento.tibox.cl`.

Los valores de URL/key deben copiarse desde **Supabase > Project Settings / API** del proyecto TIBOX Compliance.

## No agregar

No agregar al frontend ni al repositorio:

- contraseña PostgreSQL;
- connection string con password;
- claves secretas de base de datos;
- `service_role`, salvo que una funcionalidad de servidor futura realmente lo requiera.

El MVP usa la publishable key y depende de RLS para autorización.

## Después de agregar variables

Realizar un nuevo deployment de `main` desde Vercel. Si el último deployment falló durante el armado inicial del repositorio, usar **Redeploy** una vez que las variables estén guardadas.

Luego comprobar:

1. `/login` carga correctamente;
2. un usuario existente puede iniciar sesión;
3. `/app` muestra `TIBOX` y `Cliente Demo` después de ejecutar la migración Supabase;
4. `TIBOX > Decisiones Paula` contiene 23 decisiones;
5. Paula puede guardar una respuesta;
6. la tabla `audit_events` registra el cambio.

## Dominio final

Cuando se apruebe P02:

```text
cumplimiento.tibox.cl
```

se añadirá al proyecto como dominio de producción y se configurará el DNS correspondiente. No cambiar el dominio antes de que la aplicación base y el login estén validados.
