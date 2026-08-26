# Sincronización visual con WebOps

> Complemento operativo de `UI-UX-BIBLE.md` para mantener TIBOX Compliance alineado con WebOps.

## Fuente canónica compartida

Los estilos TIBOX comunes nacen en **WebOps-Tibox**:

- `app/globals.css`: tokens de marca, layout, estados y componentes base.
- `app/design-system-foundations.css`: tipografía semántica, superficies y reglas globales del Design System.

TIBOX Compliance no copia las directivas Tailwind de WebOps. La implementación compatible del sistema compartido vive en:

- `app/webops-design-system.css`

Este archivo se carga **después** de `app/globals.css` desde `app/layout.tsx`, por lo que actúa como capa canónica de alineación visual sin eliminar los estilos específicos del producto.

## Tokens comunes

| Token | Valor | Uso |
|---|---|---|
| `--tbx-brand` | `#0026BB` | marca / estructura |
| `--tbx-blue` | `#0E9CDC` | enlaces e interacción |
| `--tbx-cyan` | `#00D1FF` | soporte, foco y navegación activa |
| `--tbx-orange` | `#FF4222` | acción primaria |
| `--tbx-orange-2` | `#EA7F18` | gradiente de acción |
| `--tbx-amber` | `#FFB200` | advertencias puntuales |
| `--tbx-dark` | `#000310` | canvas oscuro |
| `--tbx-navy` | `#020B26` | sidebar / estructura oscura |

El naranjo se reserva para acciones. El celeste y azul se usan para interacción, navegación, información y foco.

## Tipografía común

Tipografía oficial: **Titillium Web**.

Tokens compartidos:

- `--tbx-font-caption: 0.8125rem`
- `--tbx-font-body: 0.875rem`
- `--tbx-font-subtitle: 0.9375rem`
- `--tbx-font-card-title: 1rem`
- `--tbx-font-section-title: 1.125rem`
- `--tbx-font-page-title: 1.5rem`

## Superficies comunes

Los componentes reutilizables deben priorizar las variables semánticas y no colores hardcodeados:

- `--tbx-card-bg`
- `--tbx-card-muted`
- `--tbx-card-border`
- `--tbx-card-text`
- `--tbx-card-muted-text`
- `--tbx-panel-bg`

Esto permite que una misma estructura funcione en tema claro y oscuro.

## Login TIBOX compartido

El patrón oficial para WebOps y Compliance es un **login split responsive**:

1. Panel izquierdo de marca y contexto del producto.
2. Panel derecho claro con tarjeta de acceso.
3. Identidad TIBOX consistente y copy específico por producto.
4. Acciones primarias en naranjo.
5. Foco/interacción en azul y celeste.
6. En móvil, el panel narrativo desaparece y queda una tarjeta de acceso compacta con marca.
7. Debe respetar `prefers-reduced-motion`.

En Compliance las clases viven dentro de `app/webops-design-system.css` (`login-split-shell`, `login-story-panel`, `login-access-panel`, etc.).

## Regla de mantenimiento

Cuando WebOps apruebe un cambio estructural de tokens, tipografía, superficies, botones, navegación o autenticación, se debe revisar el equivalente en `app/webops-design-system.css` de Compliance. Los estilos específicos de negocio pueden permanecer en `app/globals.css`, pero no deben redefinir la marca común sin una decisión explícita.

**Última sincronización:** 2026-08-26.
