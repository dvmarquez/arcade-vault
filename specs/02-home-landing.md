# SPEC 02 — Home (landing) de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-13
> **Objetivo:** Portar la landing de `references/templates/home-about/home.jsx` a la ruta `/` y mover la Biblioteca a `/juegos`, con datos mock estáticos.

## Por qué existe esta spec

SPEC 01 dejó la Biblioteca en `/` porque el prototipo original no tenía landing. El nuevo template `references/templates/home-about/` añade una Home de presentación que debe ser la primera pantalla. Esto obliga a reubicar la Biblioteca y a revisar todos los enlaces que hoy asumen que `/` es la Biblioteca.

`/juegos` se elige como nueva ruta de la Biblioteca porque ya es el prefijo de `/juegos/[id]` y `/juegos/[id]/jugar`.

## Alcance

**Entra:**

- Biblioteca movida de `/` a `/juegos` (mismo componente `Library`, metadata `Biblioteca · Arcade Vault`).
- Home en `/` con las secciones del template, en este orden:
  - Hero: siluetas pixel flotantes (8 SVG), eyebrow `▸ INSERTA UNA MONEDA_`, título en tres líneas, subtítulo, CTAs `▶ EXPLORAR JUEGOS` (→ `/juegos`) y `✦ CREAR CUENTA` (→ `/auth?modo=registro`), indicador `DESLIZA ▼`.
  - `// 01 ¿POR QUÉ ARCADE VAULT?`: 4 tarjetas con icono pixel (GAMEPAD, FREE, TROPHY, ROCKET).
  - `// 02 JUEGOS DISPONIBLES AHORA`: los 6 primeros de `GAMES` como mini-tarjetas que enlazan a `/juegos/<id>`, y botón `VER TODOS LOS JUEGOS →` (→ `/juegos`).
  - Franja de estadísticas: 3 bloques.
  - `// 03 ACTIVIDAD EN VIVO`: "ÚLTIMAS PUNTUACIONES" (7 filas) y "TOP JUGADORES · HOY" (5 filas con barra) con enlace `VER SALÓN →` (→ `/salon`).
  - `// 04 PRECIOS`: tarjeta "JUGADOR VAULT $0 / SIEMPRE" con CTA `EMPEZAR GRATIS →` (→ `/auth?modo=registro`) y 3 preguntas frecuentes.
  - CTA final `¿LISTO PARA JUGAR?` con `INSERTAR MONEDA →` (→ `/juegos`).
- Animación de aparición al hacer scroll (`.reveal` → `.reveal.in`) con `IntersectionObserver`.
- Textos ajustados a la realidad del proyecto:
  - El primer bloque de estadísticas muestra `GAMES.length` + `JUEGOS` (hoy `8 JUEGOS`) en lugar de `12+`.
  - La tarjeta "JUEGOS CLÁSICOS" cita juegos propios: "Bloque Buster, Caída, Serpentina y muchos más. Los mejores arcades de todos los tiempos en un solo lugar."
  - El resto de textos se copia literal del template.
- Estilos de la Home portados a `app/globals.css` desde `references/templates/home-about/styles.css`: bloques `HOME PAGE`, `ACTIVITY (leaderboard + ticker)` y `PRICING`.
- Nav: nuevo enlace "Inicio" (→ `/`) antes de "Biblioteca" en la barra y en el panel móvil; "Biblioteca" apunta a `/juegos`.
- Reubicación de enlaces que hoy van a `/` como Biblioteca:
  - Redirección tras enviar el formulario de acceso y tras "JUGAR COMO INVITADO" → `/juegos`.
  - "VOLVER AL VAULT" en Detalle y en el modal de Game Over → `/juegos`.
  - Botón de vuelta del Salón de la Fama → `/juegos`.
  - Logo de la nav y botón del 404 → `/` (Home).
- `/auth?modo=registro` abre `AuthForm` en la pestaña "CREAR CUENTA". Cualquier otro valor o su ausencia abre "INICIAR SESIÓN".

**Fuera de alcance (para specs futuras):**

- Página "Acerca de" (`about.jsx`) y su enlace en la nav.
- Actividad en vivo con datos reales (`av_scores`, `seededScores`) o tiempo relativo calculado.
- Gamepad, variantes de tema, marcadores flotantes y demás bloques de `styles.css` ajenos a la Home.
- Redirección de la antigua URL `/` de la Biblioteca (no hay usuarios con enlaces guardados).
- Tests automatizados.
- Reescritura de estilos a utilidades Tailwind.

## Modelo de datos

```ts
// lib/home.ts
import type { NeonColor } from "@/lib/games";

export interface RecentScore {
  player: string;    // "NEONFOX"
  gameId: string;    // Game.id; el título se resuelve con getGame()
  score: number;
  ago: string;       // texto fijo, p. ej. "hace 2 min"
  color: NeonColor;
}

export interface TopPlayer {
  rank: number;      // 1..5
  player: string;
  score: number;
}

export const RECENT_SCORES: RecentScore[];   // 7 filas del template
export const TOP_PLAYERS: TopPlayer[];       // 5 filas del template
```

Convenciones:

- Las filas de `RECENT_SCORES` usan los ids de `GAMES` equivalentes a los nombres del template: Caída → `caida`, Glotón, Invasores, Rocas, Bloque Buster → `bloque-buster`, Serpentina, Ranaria (ids exactos según `lib/games.ts`).
- Las tarjetas de características, estadísticas, precios y FAQ son contenido fijo dentro del componente de la Home; no se extraen a `lib/`.
- Números formateados con `toLocaleString("es-ES")`, igual que SPEC 01.
- El ancho de la barra de `TOP_PLAYERS` se calcula como en el template: `100 - índice * 16` %.

## Plan de implementación

1. **Biblioteca a `/juegos`.** Crear `app/juegos/page.tsx` con `Library` y la metadata de Biblioteca. Actualizar `sectionOf` en `components/nav.tsx` para que `/juegos` y `/juegos/*` cuenten como Biblioteca y cambiar el `href` de "Biblioteca" a `/juegos`. Cambiar a `/juegos` los enlaces de `app/juegos/[id]/page.tsx`, `components/game-player.tsx`, `components/hall-of-fame.tsx` y las dos redirecciones de `components/auth-form.tsx`. Verificación: `/juegos` muestra la Biblioteca y "VOLVER AL VAULT" lleva a `/juegos`.
2. **Estilos.** Copiar a `app/globals.css` los bloques `HOME PAGE`, `ACTIVITY` y `PRICING` de `references/templates/home-about/styles.css`. Añadir `@media (prefers-reduced-motion: reduce)` que muestre `.reveal` sin transición y detenga la flotación de las siluetas. Verificación: `npm run build` sin errores.
3. **Datos.** Crear `lib/home.ts` con `RecentScore`, `TopPlayer`, `RECENT_SCORES` y `TOP_PLAYERS`. Verificación: `npm run lint` sin errores.
4. **Hero.** Crear `components/floating-silhouettes.tsx`. Reemplazar `app/page.tsx` por la Home (Server Component) con el hero y la metadata de la Home. Verificación: `/` muestra el hero y los CTAs navegan a `/juegos` y `/auth?modo=registro`.
5. **Características y juegos.** Crear `components/feature-icon.tsx` y `components/mini-card.tsx` (enlace `<Link>` a `/juegos/<id>`). Añadir las secciones `// 01` y `// 02`. Verificación: pulsar la mini-tarjeta de CAÍDA navega a `/juegos/caida`.
6. **Estadísticas y actividad.** Añadir la franja de estadísticas (con `GAMES.length`) y la sección `// 03` sobre `RECENT_SCORES` y `TOP_PLAYERS`. Verificación: se ven 7 filas de últimas puntuaciones y 5 de top jugadores.
7. **Precios y CTA final.** Añadir la sección `// 04` y el CTA final. Verificación: `EMPEZAR GRATIS →` navega a `/auth?modo=registro`.
8. **Reveal.** Crear `components/reveal.tsx` (cliente) que observe los `.reveal` de la Home y añada `in` al entrar en pantalla; envolver las secciones con él. Verificación: las secciones aparecen al hacer scroll.
9. **Nav "Inicio".** Añadir el enlace "Inicio" a la barra y al panel móvil, activo solo en `/`. Verificación: en `/` está activo "Inicio"; en `/juegos` está activo "Biblioteca".
10. **Pestaña de registro.** `AuthForm` toma la pestaña inicial de `modo=registro`. Envolver el lector del query en `<Suspense>` en `app/auth/page.tsx` si el prerender con `cacheComponents` lo exige (consultar `node_modules/next/dist/docs/01-app/`). Verificación: `/auth?modo=registro` muestra el campo de correo; `/auth` no.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores y prerenderiza `/`, `/juegos`, `/auth`, `/salon` y las 8 rutas `/juegos/[id]`.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en `/` ni en `/juegos`.
- [ ] `/` muestra, en orden: hero, `// 01`, `// 02`, estadísticas, `// 03`, `// 04` y CTA final.
- [ ] `/juegos` muestra la Biblioteca con las 8 tarjetas, búsqueda y chips como en SPEC 01.
- [ ] `▶ EXPLORAR JUEGOS`, `VER TODOS LOS JUEGOS →` e `INSERTAR MONEDA →` navegan a `/juegos`.
- [ ] `✦ CREAR CUENTA` y `EMPEZAR GRATIS →` navegan a `/auth?modo=registro`, que muestra la pestaña "CREAR CUENTA" con el campo de correo.
- [ ] `/auth` sin query muestra la pestaña "INICIAR SESIÓN".
- [ ] La sección `// 02` muestra exactamente 6 mini-tarjetas y cada una navega a `/juegos/<id>`.
- [ ] El primer bloque de estadísticas muestra `8 JUEGOS`.
- [ ] Ningún texto de la Home menciona Arkanoid, Tetris ni Snake.
- [ ] "ÚLTIMAS PUNTUACIONES" muestra 7 filas y "TOP JUGADORES · HOY" muestra 5; `VER SALÓN →` navega a `/salon`.
- [ ] Las secciones con `.reveal` pasan a visibles al entrar en pantalla.
- [ ] Con `prefers-reduced-motion: reduce`, todas las secciones son visibles sin animación.
- [ ] La nav muestra "Inicio", "Biblioteca" y "Salón de la Fama"; "Inicio" está activo solo en `/` y "Biblioteca" en `/juegos`, `/juegos/<id>` y `/juegos/<id>/jugar`.
- [ ] El panel móvil incluye "Inicio" y "Biblioteca" con los mismos destinos.
- [ ] El logo de la nav y el botón del 404 navegan a `/`.
- [ ] Enviar el formulario de acceso y "JUGAR COMO INVITADO" navegan a `/juegos`.
- [ ] "VOLVER AL VAULT" (Detalle y Game Over) y el botón de vuelta del Salón navegan a `/juegos`.
- [ ] A 375 px de ancho, `/` no tiene scroll horizontal.

## Decisiones

- **Sí:** Home en `/` y Biblioteca en `/juegos`. La landing es la primera pantalla y `/juegos` agrupa listado, detalle y reproductor bajo el mismo prefijo.
- **No:** `/biblioteca`. Crearía un prefijo distinto al de `/juegos/[id]`.
- **No:** Home en `/inicio`. La landing no sería la primera pantalla.
- **Sí:** solo el enlace "Inicio" en la nav. "Acerca de" llega con su propia spec y así no hay enlaces al 404.
- **Sí:** mock estático en `lib/home.ts` para la actividad en vivo. Cero lógica nueva; la Home sigue siendo un Server Component.
- **No:** derivar la actividad de `av_scores` / `seededScores`. Requiere componente cliente y cálculo de tiempos; va en otra spec si llega.
- **Sí:** juegos de la actividad referenciados por `gameId`. El título siempre coincide con `GAMES`.
- **Sí:** contador de juegos desde `GAMES.length` y juegos propios en la tarjeta de características. No prometemos 12 juegos ni usamos marcas ajenas.
- **Sí:** botones orientados a jugar (login, invitado, VOLVER AL VAULT, Salón) van a `/juegos`; logo y 404 van a `/`. El usuario que viene de jugar quiere volver al listado, no a la landing.
- **Sí:** `/auth?modo=registro` abre la pestaña "CREAR CUENTA". El CTA cumple lo que promete con un cambio mínimo en `AuthForm`.
- **Sí:** un único componente cliente `Reveal` para la animación de scroll. El resto de la Home se renderiza en el servidor.
- **Sí:** respetar `prefers-reduced-motion`. Sin JS de animación o con movimiento reducido el contenido no puede quedar oculto.
- **Sí:** portar solo los bloques de CSS de la Home. El resto de `styles.css` ya está en `globals.css` o pertenece a otras specs.
- **No:** redirigir la URL antigua de la Biblioteca. El proyecto no tiene usuarios con enlaces guardados.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `.reveal` arranca con `opacity: 0`; si el JS falla o tarda, las secciones quedan invisibles | `Reveal` marca todo como visible si `IntersectionObserver` no existe; con movimiento reducido el CSS muestra `.reveal` sin animación. |
| Leer `searchParams` en `/auth` rompe el prerender con `cacheComponents` | Leer el query con `useSearchParams` dentro de un límite `<Suspense>`; revisar `node_modules/next/dist/docs/01-app/` antes de escribirlo. |
| Quedan enlaces a `/` que asumían la Biblioteca | El paso 1 lista todos los archivos afectados (`grep` de `href="/"` y `push("/")`); los criterios de aceptación los verifican uno por uno. |
| El CSS portado choca con clases existentes de `globals.css` | Los bloques portados usan prefijos propios (`home-`, `feature-`, `mini-`, `stat-`, `ac-`, `tk-`, `tp-`, `pc-`, `faq-`, `final-`); revisar colisiones de `.ticker`, `.kicker` y `.btn.xl` al copiarlos. |

## Lo que **no** está en esta spec

- Página "Acerca de" y su enlace en la nav.
- Actividad en vivo con datos reales.
- Gamepad y variantes de tema del template.
- Redirección de la antigua `/` de la Biblioteca.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
