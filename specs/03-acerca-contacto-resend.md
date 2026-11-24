# SPEC 03 — Página Acerca de con formulario de contacto vía Resend

> **Estado:** IMPLEMENTADO
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-24
> **Objetivo:** Portar `references/templates/home-about/about.jsx` a la ruta `/acerca` y hacer que su formulario de contacto envíe un correo real al equipo con Resend mediante una Server Action.

## Por qué existe esta spec

SPEC 02 dejó fuera la página "Acerca de" y su enlace en la nav. El template incluye un formulario de contacto que solo simula el envío en el cliente. Esta spec porta la página con fidelidad visual y sustituye la simulación por un envío real con Resend.

Es la primera funcionalidad del proyecto con lógica de servidor y secretos. Por eso fija dónde vive la clave de Resend, qué se valida en el servidor y cómo se comporta la UI cuando el envío falla, cosas que el template no contempla.

## Alcance

**Entra:**

- Página `/acerca` (Server Component, metadata `Acerca de · Arcade Vault`) con las secciones del template, en este orden:
  - Hero: kicker `▸ ACERCA DE`, título `ACERCA DE ARCADE VAULT`, párrafo de misión y fila de 3 highlights con icono pixel (HEART magenta, BROWSER cian, PLANT verde).
  - Divisor de 24 píxeles parpadeantes entre dos barras, con aparición al hacer scroll.
  - Sección de contacto con aparición al hacer scroll: kicker `▸ CONTACTO`, título `CONTÁCTANOS`, subtítulo, 3 tips con LED y el formulario.
- Todos los textos, placeholders y etiquetas se copian literal del template (incluido `HECHO CON ❤️ PARA JUGADORES`).
- Formulario de contacto con campos NOMBRE, CORREO ELECTRÓNICO y MENSAJE, y botón `▶  ENVIAR MENSAJE`:
  - Si algún campo está vacío (tras `trim`), el formulario tiembla (`.shake` 400 ms) y no se envía nada al servidor, como en el template.
  - Durante el envío el botón se deshabilita y muestra `▶ TRANSMITIENDO…`.
  - Si el servidor confirma el envío, se muestra la terminal de éxito del template con el nombre en mayúsculas.
  - Si el envío falla, se conserva lo escrito y aparece una línea de error bajo el botón con el mensaje devuelto por el servidor.
  - `ENVIAR OTRO MENSAJE` vuelve al formulario vacío.
- Campo honeypot oculto `website` (fuera de pantalla, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`).
- Server Action `sendContact` que:
  - Valida en el servidor: nombre 1–40 caracteres, correo 3–254 caracteres con formato `algo@algo.algo`, mensaje 1–2000 caracteres (todo tras `trim`).
  - Si `website` viene relleno, devuelve éxito sin enviar nada.
  - Envía un único correo en texto plano a `CONTACT_TO_EMAIL`, desde `CONTACT_FROM_EMAIL`, con reply-to igual al correo del usuario.
  - Asunto: `[Arcade Vault] Mensaje de <nombre>`. Cuerpo: nombre, correo y mensaje.
  - Si faltan variables de entorno o Resend devuelve error, registra el detalle con `console.error` en el servidor y devuelve un mensaje genérico al cliente.
- Dependencia `resend` (SDK oficial) en `package.json`.
- Variables de entorno en `.env.local` (no versionado): `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Documentadas en `README.md` y con placeholders sin valores reales en `.env.template` (versionado).
- Estilos del bloque `ABOUT PAGE` de `references/templates/home-about/styles.css` (incluidos `.btn.press`, `@keyframes shake`, `@keyframes pxblink` y la terminal) portados a `app/globals.css`, más una clase nueva `.contact-error`.
- Con `prefers-reduced-motion: reduce`: sin parpadeo de `.div-pixels`, sin `shake` y sin animación del caret.
- `Reveal` acepta `as` (`"section"` por defecto, o `"div"`) y reenvía `aria-hidden`, para cubrir el divisor del template.
- Nav: enlace "Acerca de" (→ `/acerca`) después de "Salón de la Fama", en la barra y en el panel móvil, activo solo en `/acerca`.

**Fuera de alcance (para specs futuras):**

- Correo de confirmación al usuario que escribe.
- Plantillas HTML o React Email para el correo.
- Rate limiting por IP, CAPTCHA o Turnstile.
- Guardar los mensajes en una base de datos o panel de administración.
- Verificación de dominio propio en Resend (es configuración de la cuenta, no código).
- Enlace a `/acerca` en el footer.
- Tests automatizados.
- Reescritura de estilos a utilidades Tailwind.

## Modelo de datos

```ts
// app/acerca/actions.ts ("use server")
export type ContactState =
  | { status: "idle" }
  | { status: "sent"; name: string }        // nombre tal como se escribió (trim)
  | { status: "error"; message: string };   // texto listo para mostrar

export async function sendContact(
  prev: ContactState,
  formData: FormData,                       // campos: name, email, msg, website
): Promise<ContactState>;
```

```bash
# .env.local (no versionado; .gitignore ya ignora .env*)
RESEND_API_KEY=re_xxxxxxxx
CONTACT_FROM_EMAIL="Arcade Vault <onboarding@resend.dev>"
CONTACT_TO_EMAIL=equipo@ejemplo.com
```

Convenciones:

- Nombres de campo del formulario: `name`, `email`, `msg`, `website` (honeypot).
- Límites de longitud compartidos entre `maxLength` de los inputs y la validación del servidor: 40 / 254 / 2000.
- Mensajes de error al cliente, en mayúsculas como el resto de la UI:
  - Validación: `✖ REVISA LOS CAMPOS E INTÉNTALO DE NUEVO.`
  - Configuración o fallo de Resend: `✖ NO SE PUDO ENVIAR EL MENSAJE. INTÉNTALO MÁS TARDE.`
- El cliente de Resend se crea dentro de la acción, no a nivel de módulo, para que `npm run build` no dependa de la clave.

## Plan de implementación

1. **Estilos.** Copiar a `app/globals.css` el bloque `ABOUT PAGE` de `references/templates/home-about/styles.css` hasta `.term-body .caret`, sin duplicar `.field` ni `.btn.xl` ya existentes. Añadir `.contact-error` (texto magenta, fuente mono, 12 px) y las reglas de `prefers-reduced-motion` para `.div-pixels span`, `.contact-form.shake` y `.term-body .caret`. Verificación: `npm run build` sin errores.
2. **Reveal polimórfico.** Añadir a `components/reveal.tsx` la prop `as?: "section" | "div"` (por defecto `"section"`) y el reenvío de `aria-hidden`. Verificación: la Home se ve igual que antes y `npm run lint` pasa.
3. **Página estática.** Crear `components/highlight-icon.tsx` con los 3 SVG del template. Crear `app/acerca/page.tsx` con hero, highlights, divisor (`<Reveal as="div" aria-hidden>`) y sección de contacto (`<Reveal>`), con el formulario aún sin acción. Verificación: `/acerca` se ve como el template.
4. **Nav.** Añadir `"acerca"` a `Section` y a `sectionOf` en `components/nav.tsx`, y el enlace "Acerca de" en la barra y en el panel móvil. Verificación: en `/acerca` el enlace está activo y ningún otro lo está.
5. **Server Action.** Instalar `resend`. Crear `app/acerca/actions.ts` con `ContactState` y `sendContact` (validación, honeypot, comprobación de variables de entorno, envío y manejo de error). Consultar `node_modules/next/dist/docs/01-app/` sobre Server Actions antes de escribirla. Documentar las tres variables en `README.md` y dejarlas con placeholders en `.env.template`. Verificación: `npm run lint` y `npm run build` sin errores, sin `.env.local`.
6. **Formulario conectado.** Crear `components/contact-form.tsx` (cliente) con inputs controlados, `useActionState(sendContact, { status: "idle" })`, `shake` en vacío, estado pendiente, línea de error, honeypot, terminal de éxito y `ENVIAR OTRO MENSAJE`. Sustituir el formulario estático de `app/acerca/page.tsx`. Verificación: con `.env.local` válido, enviar un mensaje lo entrega en `CONTACT_TO_EMAIL` y muestra la terminal.

## Criterios de aceptación

- [X] `npm run lint` termina sin errores.
- [X] `npm run build` termina sin errores sin `.env.local` y prerenderiza `/acerca`.
- [X] La consola del navegador no muestra errores ni avisos de hidratación en `/acerca`.
- [X] `/acerca` muestra, en orden: hero con 3 highlights, divisor de 24 píxeles y sección de contacto.
- [X] Los textos de `/acerca` coinciden literalmente con `references/templates/home-about/about.jsx`.
- [X] El divisor y la sección de contacto pasan a visibles al entrar en pantalla.
- [X] Con `prefers-reduced-motion: reduce`, todo es visible y los píxeles del divisor no parpadean.
- [X] La nav y el panel móvil muestran "Acerca de" después de "Salón de la Fama"; está activo solo en `/acerca`.
- [X] Enviar con algún campo vacío hace temblar el formulario y no genera ninguna petición al servidor.
- [X] Durante el envío el botón está deshabilitado y muestra `▶ TRANSMITIENDO…`.
- [X] Con `.env.local` válido, enviar el formulario entrega un correo en `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <nombre>`, el mensaje en el cuerpo y reply-to igual al correo escrito.
- [X] Tras un envío correcto se muestra la terminal con `GRACIAS, <NOMBRE>.`
- [X] `ENVIAR OTRO MENSAJE` muestra el formulario con los tres campos vacíos.
- [X] Sin `RESEND_API_KEY`, enviar muestra `✖ NO SE PUDO ENVIAR EL MENSAJE. INTÉNTALO MÁS TARDE.`, conserva lo escrito y el servidor registra el motivo.
- [X] Un envío con correo inválido o mensaje de más de 2000 caracteres (forzado sin pasar por el cliente) devuelve `✖ REVISA LOS CAMPOS E INTÉNTALO DE NUEVO.` y no llama a Resend.
- [X] Un envío con `website` relleno muestra la terminal de éxito y no llama a Resend.
- [X] `RESEND_API_KEY` no aparece en ningún bundle de cliente (`.next/static`).
- [X] A 375 px de ancho, `/acerca` no tiene scroll horizontal.

## Decisiones

- **Sí:** ruta `/acerca`. Corta, en español y coherente con `/juegos` y `/salon`.
- **No:** `/about` ni `/acerca-de`. Rompen la convención o alargan la URL sin aportar.
- **Sí:** Server Action con `useActionState`. Sin endpoint REST adicional y encaja con App Router y React 19.
- **No:** Route Handler `/api/contacto`. Más código y más superficie pública para el mismo resultado.
- **Sí:** remitente, destinatario y clave en variables de entorno. Permite cambiar de entorno sin tocar código y mantiene el secreto fuera del repo.
- **Sí:** `.env.template` versionado con placeholders vacíos (decidido durante la implementación). Quien clona el repo sabe qué variables definir sin exponer ningún secreto.
- **Sí:** reply-to con el correo del usuario. El equipo responde directamente desde su cliente de correo.
- **No:** correo de confirmación al usuario. Convertiría el formulario en un relé para enviar correos a direcciones ajenas.
- **Sí:** texto plano. Cero dependencias extra para un correo interno.
- **No:** React Email. Una dependencia más sin beneficio para el equipo.
- **Sí:** validación en servidor más honeypot. Freno básico al spam sin infraestructura nueva.
- **No:** rate limiting. En memoria no es fiable en serverless y bien hecho requiere un store externo; va en otra spec si el spam aparece.
- **Sí:** honeypot con éxito silencioso. El bot no recibe señal de que fue detectado.
- **Sí:** validación de campos vacíos en el cliente con `shake`, como el template. Respuesta inmediata sin ida al servidor.
- **Sí:** inputs controlados. Conservan lo escrito si el envío falla, en lugar del reseteo automático de formularios de React 19.
- **Sí:** mensajes de error genéricos al cliente y detalle solo en el log del servidor. No se filtran errores de Resend ni de configuración.
- **Sí:** cliente de Resend creado dentro de la acción. El build no falla sin clave.
- **Sí:** extender `Reveal` con `as` en lugar de crear otro componente. El divisor del template es un `div` y un solo componente sigue gobernando la animación.
- **Sí:** enlace solo en nav y panel móvil, como `references/templates/home-about/nav.jsx`.
- **No:** enlace en el footer. No está en el template.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con `onboarding@resend.dev` como remitente, Resend solo entrega al correo del dueño de la cuenta | Documentado en `README.md`: en desarrollo `CONTACT_TO_EMAIL` debe ser el correo de la cuenta Resend; en producción hace falta un dominio verificado. |
| La Server Action es un endpoint público invocable sin pasar por la UI | Toda la validación se repite en el servidor; el criterio de aceptación la prueba forzando la petición. |
| La API de Server Actions o del SDK de Resend difiere de lo conocido (nombre del campo reply-to, forma de `{ data, error }`) | Consultar `node_modules/next/dist/docs/01-app/` y la documentación actual de Resend antes del paso 5. |
| Filtrar `RESEND_API_KEY` al cliente | La clave solo se lee en `app/acerca/actions.ts` (`"use server"`), sin prefijo `NEXT_PUBLIC_`; un criterio de aceptación busca la clave en `.next/static`. |
| `.reveal` arranca con `opacity: 0` y el formulario podría quedar invisible | Se reutiliza `Reveal`, que ya cubre la ausencia de `IntersectionObserver` y el movimiento reducido (SPEC 02). |
| El CSS portado choca con clases existentes (`.field`, `.btn.xl`, `@keyframes blink`) | Copiar solo las reglas ausentes de `app/globals.css` y revisar duplicados al portarlas. |

## Lo que **no** está en esta spec

- Correo de confirmación al usuario.
- Plantillas HTML o React Email.
- Rate limiting, CAPTCHA o Turnstile.
- Persistencia de mensajes o panel de administración.
- Verificación de dominio en Resend.
- Enlace a `/acerca` en el footer.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
