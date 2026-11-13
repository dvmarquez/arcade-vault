# SPEC 01 — MVP visual de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** —
> **Fecha:** 2026-11-13
> **Objetivo:** Portar las cinco pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor, Acceso y Salón de la Fama) a rutas del App Router con datos mock y sesión simulada en localStorage, sin implementar ningún juego.

## Por qué existe esta spec

El prototipo de `references/templates/` es una SPA en React 18 cargada con Babel en el navegador, con un router propio basado en el hash. El proyecto real es Next.js 16 con App Router y Cache Components. Esta spec fija cómo se traduce el prototipo a esa arquitectura para que el resultado se vea igual sin arrastrar el router casero.

El tema visual ya está portado: `app/globals.css` contiene las clases de `references/templates/styles.css` y `app/layout.tsx` carga las fuentes (Press Start 2P, JetBrains Mono, Courier Prime) y los fondos `.av-bg` / `.av-noise`.

## Alcance

**Entra:**

- Rutas App Router para cada pantalla:
  - `/` → Biblioteca (hero, buscador, chips de categoría, grilla de tarjetas con efecto tilt, estado "NO HAY RESULTADOS").
  - `/juegos/[id]` → Detalle (portada, etiquetas, descripción larga, franja de estadísticas, acciones, tabla de 10 mejores puntuaciones).
  - `/juegos/[id]/jugar` → Reproductor simulado (HUD, CRT con arena animada por CSS, pausa, fin, modal de Game Over).
  - `/auth` → Acceso (pestañas Iniciar sesión / Crear cuenta, campo de correo solo en "Crear cuenta", jugar como invitado, botones sociales sin acción).
  - `/salon` → Salón de la Fama (pestañas por juego, podio 1-2-3, tabla de 12 filas, fila "TU MEJOR MARCA").
- Nav global (logo, enlaces con estado activo, contador de créditos estático `CRÉDITOS · 03`, botón de sesión, menú hamburguesa móvil con panel lateral) y footer en `app/layout.tsx`.
- Datos mock tipados: 8 juegos, categorías, jugadores y generador determinista `seededScores`, copiados de `references/templates/data.jsx`.
- Sesión simulada en localStorage:
  - `av_user` → usuario logueado (`{ name }`), escrito por el formulario de acceso, borrado al cerrar sesión.
  - `av_scores` → puntuaciones guardadas desde el modal de Game Over.
- Simulación del Reproductor igual al template: la puntuación sube cada 220 ms, el nivel sube cada ~2500 puntos, PAUSA/REANUDAR detiene el contador, FIN abre el modal, JUGAR DE NUEVO reinicia, GUARDAR PUNTUACIÓN escribe en `av_scores`.
- Fila "TU MEJOR MARCA" del Salón calculada desde `av_scores` (mejor puntuación del usuario actual para el juego seleccionado). Si no hay puntuación guardada, la fila no se muestra.
- `app/not-found.tsx` temático para ids de juego inexistentes (`notFound()` en Detalle y Reproductor).
- Metadata por página (`title`) en español.
- Eliminar el contenido de plantilla de create-next-app (`app/page.tsx` actual y los SVG de `public/` que dejan de usarse).

**Fuera de alcance (para specs futuras):**

- Cualquier juego real (canvas, lógica, controles de teclado/táctil).
- Autenticación real, validación de contraseñas, OAuth con Google o GitHub.
- Backend, base de datos o API de puntuaciones.
- Sistema de créditos funcional.
- Menú desplegable de cuenta (el botón con el nombre cierra sesión directamente, como el template).
- Tests automatizados.
- Reescritura de los estilos a utilidades Tailwind.

## Modelo de datos

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type NeonColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;        // slug, p. ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;     // clase CSS de portada, p. ej. "cover-bricks"
  color: NeonColor;
  best: number;
  plays: string;     // "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;      // "dd/mm/2026"
}

export const GAMES: Game[];                       // 8 juegos del template
export const CATS: readonly ["TODOS", ...Category[]];
export function getGame(id: string): Game | undefined;
export function seededScores(seed: number, count?: number): ScoreRow[];
```

```ts
// lib/session.tsx ("use client")
export interface User { name: string }           // máx. 10 caracteres, mayúsculas

export interface SavedScore {
  game: string;      // Game.id
  score: number;
  name: string;
  at: number;        // Date.now()
}

// Claves de localStorage (mismo formato que el template)
// "av_user"   → User | null (JSON)
// "av_scores" → SavedScore[] (JSON)

// SessionProvider expone vía useSession():
//   user, login(user), logout(), saveScore(entry), scores
```

Convenciones:

- Las semillas de `seededScores` se mantienen idénticas al template: Detalle usa `id.length * 17 + 3` con 10 filas; Salón usa `id.length * 23 + 7` con 12 filas.
- Números formateados con `toLocaleString("es-ES")`.
- La lectura de localStorage ocurre solo en el cliente tras la hidratación; el render del servidor asume `user = null` y `scores = []`.

## Plan de implementación

1. **Datos mock.** Crear `lib/games.ts` con tipos, `GAMES`, `CATS`, `PLAYERS`, `getGame` y `seededScores`. Verificación: `npm run lint` sin errores.
2. **Sesión.** Crear `lib/session.tsx` con `SessionProvider` y `useSession` sobre `av_user` / `av_scores`, tolerante a localStorage no disponible o JSON corrupto. Envolver `children` en `app/layout.tsx`. Verificación: la app arranca con `npm run dev`.
3. **Nav y footer.** Crear `components/nav.tsx` (cliente: `usePathname` para el estado activo, panel móvil, botón de sesión) y el footer en `app/layout.tsx`. Verificación: la nav se ve en `/` y el menú hamburguesa abre y cierra bajo 840 px.
4. **Biblioteca.** Crear `components/game-card.tsx` (tilt con mouse, enlace a `/juegos/[id]`) y `components/library.tsx` (búsqueda + chips). Reemplazar `app/page.tsx`. Borrar los SVG de plantilla no usados en `public/`. Verificación: filtrar por "PUZZLE" deja solo CAÍDA; buscar "zzz" muestra "NO HAY RESULTADOS".
5. **404 temático.** Crear `app/not-found.tsx`. Verificación: `/ruta-inexistente` muestra la pantalla arcade.
6. **Detalle.** Crear `app/juegos/[id]/page.tsx` con `generateStaticParams` sobre `GAMES`, `generateMetadata` y `notFound()` para ids desconocidos. Verificación: `/juegos/caida` muestra la portada y 10 filas; `/juegos/xyz` muestra el 404.
7. **Reproductor.** Crear `app/juegos/[id]/jugar/page.tsx` (servidor: valida id) y `components/game-player.tsx` (cliente: simulación, pausa, modal, guardado vía `saveScore`). Verificación: FIN abre el modal y GUARDAR PUNTUACIÓN añade una entrada a `av_scores`.
8. **Acceso.** Crear `app/auth/page.tsx` y `components/auth-form.tsx`. El submit hace `login` y navega a `/`; "JUGAR COMO INVITADO" hace `logout` y navega a `/`. Verificación: tras entrar como `px_kai`, la nav muestra `PX_KAI ▾`; pulsarlo vuelve a "Iniciar Sesión".
9. **Salón de la Fama.** Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (pestañas, podio, tabla, fila "TU MEJOR MARCA" desde `scores`). Verificación: con una puntuación guardada para BLOQUE BUSTER y sesión iniciada, la fila aparece en esa pestaña y no en las demás.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores y prerenderiza `/`, `/auth`, `/salon` y las 8 rutas `/juegos/[id]`.
- [ ] No queda contenido de create-next-app (logo de Next, enlaces a Vercel) en ninguna pantalla.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación al cargar cada ruta.
- [ ] `/` muestra las 8 tarjetas; el chip "SHOOTER" deja exactamente INVASORES y ROCAS.
- [ ] Buscar "serp" deja solo SERPENTINA; buscar "zzz" muestra "NO HAY RESULTADOS".
- [ ] Pulsar una tarjeta o su botón JUGAR navega a `/juegos/<id>`.
- [ ] `/juegos/bloque-buster` muestra 10 filas de puntuación con las tres primeras resaltadas.
- [ ] "▶ JUGAR AHORA" navega a `/juegos/<id>/jugar`; "VOLVER AL VAULT" navega a `/`.
- [ ] `/juegos/xyz` y `/juegos/xyz/jugar` muestran el 404 temático.
- [ ] En el Reproductor la puntuación sube sola; PAUSA la congela y muestra "EN PAUSA"; REANUDAR la reactiva.
- [ ] FIN abre el modal con la puntuación final; GUARDAR PUNTUACIÓN muestra "▸ PUNTUACIÓN GUARDADA_" y añade una entrada a `av_scores`.
- [ ] JUGAR DE NUEVO reinicia puntuación a 0, vidas a 3 y nivel a 01.
- [ ] En `/auth` la pestaña "CREAR CUENTA" muestra el campo de correo y "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario guarda `av_user`, navega a `/` y la nav muestra el nombre en mayúsculas.
- [ ] Recargar la página mantiene la sesión iniciada.
- [ ] Pulsar el botón con el nombre en la nav cierra la sesión y borra `av_user`.
- [ ] El enlace activo de la nav es "Biblioteca" en `/`, `/juegos/<id>` y `/juegos/<id>/jugar`, y "Salón de la Fama" en `/salon`.
- [ ] `/salon` muestra podio y 12 filas; cambiar de pestaña cambia los nombres y puntuaciones.
- [ ] Sin sesión, la fila "TU MEJOR MARCA" no aparece; con sesión y una puntuación guardada para el juego seleccionado, aparece con esa puntuación.
- [ ] A 375 px de ancho no hay scroll horizontal y el menú hamburguesa reemplaza a los enlaces.

## Decisiones

- **Sí:** rutas reales del App Router. Dan URLs compartibles, prerender estático y navegación con `<Link>`.
- **No:** copiar el router por hash del template. Duplica lo que ya resuelve Next y rompe el prerender.
- **Sí:** localStorage con las claves `av_user` y `av_scores` del template. Mantiene el comportamiento del prototipo sin backend.
- **No:** estado solo en memoria. La sesión se perdería al recargar y el Salón nunca mostraría marcas propias.
- **Sí:** reutilizar las clases ya portadas en `app/globals.css`. Garantiza fidelidad visual con el template.
- **No:** reescribir a utilidades Tailwind. Mucho trabajo y riesgo de diferencias visuales; Tailwind solo sustituye estilos inline puntuales.
- **Sí:** simulación del Reproductor idéntica al template. Permite probar el flujo completo Game Over → guardar → Salón sin un juego real.
- **Sí:** "TU MEJOR MARCA" desde `av_scores`. Cierra el ciclo con datos reales del usuario en vez de un valor inventado.
- **No:** fecha fija y rango inventado del template para esa fila.
- **Sí:** `lib/` para datos y sesión, `components/` para componentes de UI. Separa datos, estado y presentación.
- **Sí:** páginas como Server Components que validan el id y delegan la interactividad a componentes cliente. Mantiene el JS cliente acotado.
- **Sí:** `notFound()` con `app/not-found.tsx` temático para ids desconocidos.
- **No:** menú desplegable de cuenta. El template cierra sesión al pulsar el nombre y así se mantiene.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Desajuste de hidratación al leer localStorage durante el render | El provider arranca con `user = null` y `scores = []` y lee localStorage tras montar (o con `useSyncExternalStore` y snapshot de servidor vacío). |
| `cacheComponents` exige que el acceso a datos dinámicos esté bajo `<Suspense>` | Los datos mock son estáticos; `params` se resuelven en rutas con `generateStaticParams`. Revisar `node_modules/next/dist/docs/01-app/` antes de escribir las páginas dinámicas. |
| localStorage no disponible (modo privado) o JSON corrupto | Lecturas y escrituras en `try/catch`; se cae a valores vacíos y la UI sigue funcionando sin persistir. |
| El efecto tilt manipula `style.transform` directamente | Se limita a un `ref` dentro de `GameCard`; no afecta al estado de React. |

## Lo que **no** está en esta spec

- Ningún juego real.
- Autenticación real ni OAuth.
- Backend o API de puntuaciones.
- Créditos funcionales.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
