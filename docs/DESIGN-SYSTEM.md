# Design System — TIBOX Compliance

## Fuente de diseño

La aplicación adopta el sistema de diseño TIBOX entregado para portales/apps. No se crea una identidad paralela para Compliance.

## Principio visual

**El color jerarquiza, no decora.**

Regla principal:

- naranjo = acción;
- azul de marca = estructura y confianza;
- celeste = apoyo/interacción/acento;
- superficies claras para lectura intensiva;
- superficies oscuras para marca, navegación o quiebres controlados.

## Uso específico para la aplicación

TIBOX Compliance es un portal de trabajo con tablas, formularios y datos. Por lo tanto:

- densidad `compact`;
- predominio de superficies claras;
- header/sidebar de marca u oscuro;
- glow desactivado en vistas de operación;
- tarjetas con sombras mínimas;
- acento azul/celeste;
- naranjo reservado a CTA reales.

## Tokens de marca

```css
:root {
  --tbx-brand: #0026BB;
  --tbx-blue: #0E9CDC;
  --tbx-cyan: #00D1FF;
  --tbx-orange: #FF4222;
  --tbx-orange-2: #EA7E18;
  --tbx-yellow: #FFB200;
  --tbx-dark: #020B26;

  --tbx-font: "Titillium Web", system-ui, sans-serif;
  --tbx-mono: "IBM Plex Mono", monospace;
}
```

## Superficies

### `light`

- fondo `#FFFFFF`;
- contenido principal;
- formularios;
- tablas;
- dashboards.

### `light-alt`

- fondo `#F7F7F7`;
- separación de secciones;
- fondos de áreas de trabajo.

### `brand`

- fondo azul profundo;
- header;
- navegación principal;
- footer si aplica.

### `dark`

- fondo `#020B26`;
- login;
- hero de onboarding;
- estados vacíos o secciones puntuales de alta identidad.

No alternar temas arbitrariamente dentro de una vista de operación.

## Tipografía

- Titillium Web para display y cuerpo.
- IBM Plex Mono solo para etiquetas técnicas puntuales.
- peso máximo: 700.
- jerarquía por tamaño, espacio y peso, no por múltiples colores.

Aplicación sugerida:

```text
Page title       32–40px / 700
Section title    24–28px / 700
Card title       18–20px / 600–700
Body             16px / 400
Table/body-sm    14px / 400
Eyebrow/meta     12–13px / 600 mono
```

## Botones

### Primario

Solo para la acción principal de una vista.

```text
background: naranja TIBOX
label: blanco bold
```

Ejemplos:

- Guardar cambios.
- Adjuntar evidencia.
- Crear acción.
- Invitar usuario.

No usar naranjo para:

- badges de estado;
- iconos decorativos;
- títulos;
- links normales;
- porcentajes.

### Secundario

Outline/azul para acciones alternativas.

### Destructivo

Usar rojo semántico específico del producto, no el naranjo de marca. Siempre requerir confirmación cuando exista pérdida de datos.

## Estados semánticos

Los colores de estado son una capa funcional distinta de los colores de marca.

- success: verde;
- warning: ámbar;
- danger: rojo;
- info: azul/celeste;
- neutral: gris/navy suave.

El CTA naranjo no debe confundirse con warning.

## Cards

- fondo de superficie;
- borde hairline;
- radio aproximado 16px;
- sombra muy sutil o ninguna;
- hover mediante cambio leve de superficie/borde;
- evitar sombras pesadas.

## Header y sidebar

### Desktop

- sidebar persistente y compacta;
- logo TIBOX;
- organización activa;
- navegación principal;
- usuario/rol;
- selector de organización solo cuando aplique.

### Mobile

- sidebar colapsable;
- acciones principales accesibles;
- tablas con patrón responsive, no solo scroll infinito.

## Franja de marca

El gradiente identitario TIBOX se puede usar como acento delgado de 4–6px, preferentemente una vez en el shell principal/login. No repetirlo por card o sección.

## Iconografía

- SVG de línea consistente;
- Lucide como librería propuesta;
- no emojis como iconos de interfaz.

## Focus y accesibilidad

- focus visible en todo elemento interactivo;
- contraste AA como mínimo;
- no comunicar estado solo con color;
- labels asociados a inputs;
- keyboard navigation;
- `prefers-reduced-motion` respetado;
- motion corto 150–300ms.

## Estructura visual del dashboard

```text
┌ Sidebar ─────────┬──────────────────────────────────────────┐
│ TIBOX            │ Organización / breadcrumb       Usuario │
│ Compliance       ├──────────────────────────────────────────┤
│                  │ Título de vista                          │
│ Inicio           │ descripción breve            [CTA]       │
│ Cumplimiento     │                                          │
│ Seguridad        │ KPIs                                     │
│ Acciones         │                                          │
│ Evidencias       │ Contenido principal                     │
│ Reportes         │ tablas / cards / formularios            │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

## Anti-patrones

- naranjo decorativo;
- celeste claro como texto pequeño sobre blanco;
- `font-weight: 900`;
- demasiados gradientes;
- retículas decorativas en dashboards;
- sombras pesadas;
- más de un acento compitiendo;
- quitar focus visible;
- emojis como iconos;
- cards excesivas cuando una tabla o lista es más clara.

## Branding por cliente

Pendiente de decisión: la arquitectura puede permitir logo/nombre del cliente en un área secundaria, pero la aplicación debe mantener identidad TIBOX. Ver `DECISIONES-PAULA.md`.