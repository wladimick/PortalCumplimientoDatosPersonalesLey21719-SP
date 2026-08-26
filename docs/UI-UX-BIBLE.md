# TIBOX Compliance — Biblia UI/UX

> Documento normativo para diseñar y desarrollar la interfaz sin romper consistencia, accesibilidad ni seguridad.
>
> **Fecha base:** 2026-08-26  
> **Modelo IA:** GPT-5.6 Sol  
> **Producto:** TIBOX Compliance  
> **Stack visual:** Next.js 16 + React 19 + TypeScript + CSS nativo + Lucide

## 1. Principios

1. **Ejecutivo primero.** La portada del cliente debe responder en segundos: estado general, pendientes, riesgos, acciones y avance por módulo.
2. **El color jerarquiza, no decora.** Naranjo = acción. Celeste = apoyo/información. Azul profundo = estructura/marca.
3. **Densidad profesional.** Tamaños normales, sin titulares gigantes en la aplicación. La interfaz debe soportar muchas filas y datos sin parecer una landing page.
4. **Accesibilidad visible.** Tema claro/oscuro, tamaño de texto, foco visible, navegación por teclado, reduced motion y contraste AA como mínimo.
5. **Mismos patrones para los mismos problemas.** No crear un botón, badge, tabla, modal o formulario nuevo si existe un componente equivalente.
6. **La seguridad no depende de la UI.** Ocultar un botón no otorga ni revoca permisos. RLS y server actions validan nuevamente.
7. **Responsive real.** La aplicación debe funcionar desde 360 px hasta escritorio ancho; las tablas pueden desplazarse horizontalmente sin romper el layout.

## 2. Marca TIBOX

La fuente de verdad visual es el sistema TIBOX entregado al proyecto. La aplicación usa:

- Azul TIBOX estructural: `#0026BB`.
- Azul secundario: `#0E9CDC`.
- Celeste apoyo: `#00D1FF`.
- Naranjo acción: `#FF4222`.
- Naranjo secundario: `#EA7E18`.
- Amarillo: `#FFB200`, solo para alertas puntuales.
- Tipografía oficial: **Titillium Web**, pesos 400, 600 y 700.
- Iconografía: **Lucide**; no usar emojis como iconos de interfaz.
- Logo: componente `components/brand/tibox-brand.tsx`, basado en el SVG oficial definido por el sistema de diseño.

### Regla de acción

El naranjo se reserva a acciones primarias: Guardar, Crear, Adjuntar, Confirmar, Enviar. Elementos informativos no deben usar naranjo.

## 3. Modos claro y oscuro

La aplicación debe ser funcional en ambos modos.

### Claro

- Fondo: gris muy claro.
- Superficies: blanco.
- Texto: navy.
- Sidebar: azul casi negro.
- Bordes suaves y sombras mínimas.

### Oscuro

- Canvas: `#000310` / `#020617`.
- Superficies: `#0A1130` y `#121A40`.
- Texto principal: blanco frío.
- Texto secundario: gris azulado.
- Naranjo sigue siendo acción.

La preferencia se guarda en `localStorage` y se aplica mediante `data-theme` sobre `<html>`.

## 4. Escala tipográfica de aplicación

La base es 16 px. El usuario puede elegir una escala aproximada de 90%, 100%, 110% y 120%.

| Token conceptual | Uso | Tamaño base |
|---|---|---:|
| Page title | H1 aplicación | 30–34 px |
| Section title | H2 | 20–22 px |
| Card title | H3 | 16–18 px |
| Body | texto normal | 16 px |
| Compact | tablas/metadatos | 13–14 px |
| Eyebrow | labels técnicos | 12 px |
| KPI | cifra ejecutiva | 30–38 px |

**Máximo peso:** 700. No usar 800/900.

## 5. Layouts oficiales

### 5.1 Shell de aplicación

`Sidebar + Topbar + Content` para administración y trabajo operativo.

- Sidebar: navegación primaria y organización activa.
- Topbar: búsqueda global, accesibilidad, identidad y cierre de sesión.
- Content: ancho máximo amplio, margen automático.

### 5.2 Inicio ejecutivo del cliente

La ruta `/app/[orgSlug]/dashboard` de clientes externos se muestra **sin sidebar y sin topbar**. Es una vista ejecutiva independiente y presentable en reunión o pantalla compartida.

Debe contener:

- marca + cliente;
- fecha/estado;
- buscador;
- acceso discreto a “Abrir portal”;
- score documental;
- score técnico;
- obligaciones;
- riesgos altos;
- evidencias;
- acciones abiertas;
- módulos con progreso;
- próximas acciones;
- riesgos prioritarios.

### 5.3 Interno TIBOX

La organización interna sí usa shell completo y expone herramientas de administración y decisiones de producto.

## 6. Navegación

Orden base:

1. Inicio
2. Cumplimiento
3. Seguridad
4. Acciones
5. Evidencias
6. Reportes
7. Administración *(solo cuando corresponda)*
8. Decisiones Paula *(solo organización interna)*

Nunca mostrar una ruta sensible solo porque el usuario conoce la URL. La página debe validar organización y rol en servidor.

## 7. Topbar

Componentes obligatorios:

- búsqueda global;
- disminuir tamaño de texto;
- restablecer tamaño;
- aumentar tamaño;
- claro/oscuro;
- avatar/nombre/rol;
- cerrar sesión.

Los controles puramente icónicos llevan `aria-label` y `title`.

## 8. Buscador global

Debe buscar dentro de la organización activa, nunca transversalmente entre clientes.

Primer alcance:

- obligaciones;
- controles de seguridad;
- acciones.

La consulta se procesa en servidor usando la sesión y RLS. El frontend no recibe datos de organizaciones a las que el usuario no pertenece.

## 9. Componentes

### 9.1 Botón primario

- fondo naranjo;
- texto blanco, 600/700;
- alto mínimo 40–42 px;
- hover discreto;
- focus celeste visible.

### 9.2 Botón secundario

- superficie neutra;
- borde visible;
- texto azul/celeste según tema.

### 9.3 Botón ghost

Para utilidades de baja prominencia: tema, tamaño, cerrar, opciones.

### 9.4 Badge / estado

Estados semánticos:

- verde: cumplido/completado;
- amarillo: pendiente/atención;
- rojo: alto/crítico/bloqueado;
- azul: en proceso/información;
- gris: neutral/no aplica.

No depender únicamente del color: siempre incluir texto.

### 9.5 KPI Card

Contiene label, cifra, icono opcional y contexto breve. No debe convertirse en una tarjeta decorativa.

### 9.6 Card

- borde 1 px;
- radio 14–16 px;
- sombra mínima en claro;
- sin sombra pesada en oscuro.

### 9.7 DataTable

El patrón de tabla toma como referencia la usabilidad de SharePoint Lists, sin copiar su estética literalmente.

Debe soportar:

- búsqueda/filtro de texto;
- filtro por estado cuando exista;
- ordenar por columna;
- mostrar/ocultar columnas;
- persistir columnas visibles por usuario/navegador;
- exportar CSV;
- scroll horizontal;
- hover de fila;
- empty state;
- acción “Nuevo” fuera de la tabla;
- futuras vistas guardadas y paginación.

Las tablas no deben asumir que todas las columnas caben en pantalla.

### 9.8 Formularios

- label siempre visible;
- placeholder es ejemplo, no reemplaza label;
- mensajes de error cercanos al campo o formulario;
- acciones destructivas separadas visualmente.

### 9.9 Empty state

Explica qué falta y qué puede hacer el usuario. Evitar mensajes técnicos.

### 9.10 Danger Zone

Solo para operaciones irreversibles. Requiere:

- explicación de impacto;
- motivo categorizado;
- confirmación escribiendo slug/nombre;
- acción roja;
- validación nuevamente en servidor;
- auditoría de plataforma sin conservar PII del cliente eliminado.

## 10. Tablas por módulo

### Cumplimiento

Columnas recomendadas: código, obligación, módulo, referencia legal, prioridad, estado, responsable, fecha objetivo, revisión.

### Seguridad

Control, categoría, descripción, nivel, estado, recomendación, responsable, revisión.

### Acciones

Acción, origen, prioridad, estado, responsable, vencimiento.

### Usuarios y accesos

Correo, organización, rol, estado, fecha de alta, acciones.

## 11. Responsive

Breakpoints conceptuales:

- `< 640`: móvil; una columna, acciones compactas, tablas con scroll.
- `640–1024`: tablet; grids de 2 columnas.
- `> 1024`: escritorio; shell completo.

En móvil el sidebar debe evolucionar a drawer. Hasta implementarlo, la navegación debe degradar sin pérdida de contenido.

## 12. Accesibilidad

Obligatorio:

- `:focus-visible` siempre presente;
- `aria-label` en botones solo-icono;
- contraste AA;
- controles alcanzables por teclado;
- `prefers-reduced-motion`;
- no usar color como único indicador;
- zoom del navegador no debe romper la interfaz;
- tamaño de texto configurable sin recargar.

## 13. Animación

Duración: 150–250 ms. Solo para feedback: hover, apertura, transición de tema. No usar animaciones ornamentales en dashboards.

## 14. Microcopy

- breve y accionable;
- evitar jerga interna frente al cliente;
- “Cumplido”, no “OK”; “En proceso”, no “WIP”;
- acciones verbales: “Nueva obligación”, “Agregar acceso”, “Exportar CSV”.

## 15. Anti-patrones

- naranjo en elementos no accionables;
- cards enormes con poco contenido;
- titulares de landing dentro de vistas operativas;
- tablas sin scroll o con texto truncado sin alternativa;
- ocultar permisos solo con CSS;
- usar `service_role` en cliente;
- componentes con estilos inline repetidos;
- hardcodear organizaciones, IDs o URLs de Supabase;
- cambiar una migración ya ejecutada;
- eliminar focus por estética.

## 16. Checklist para un componente nuevo

Antes de aprobar un componente:

- ¿ya existe uno equivalente?
- ¿funciona claro/oscuro?
- ¿funciona con escala de texto 120%?
- ¿tiene teclado/focus?
- ¿es responsive?
- ¿el naranjo se usa solo si es acción?
- ¿respeta RLS/servidor si modifica datos?
- ¿documentamos el componente o patrón?

## 17. Fuente de verdad

Cuando código y documento difieran, primero se revisa si el cambio fue intencional. Si se aprueba un nuevo patrón, se actualiza esta Biblia en el mismo PR. Ningún cambio visual estructural se considera completo si la documentación queda desactualizada.
