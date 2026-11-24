## Arcade Vault

Es una plataforma para jugar online y competir por la mayor cantidad de puntos.

## Usa Spec Driven Design

Basado en /spec y /spec-impl

Siguiendo las buenas practicas recomendadas aquí:
https://github.com/Klerith/fernando-skills

## Skills usadas

```bash
npx skills@latest add Klerith/fernando-skills
```

## Commands

- `npm run dev`: dev server at http://localhost:3000
- `npm run build`: production build (also type-checks)
- `npm run lint`: ESLint 9 flat config (`eslint.config.mjs`, next core-web-vitals + typescript)
- Type-check only: `npx tsc --noEmit`

No test framework is configured yet.

## Variables de entorno

El formulario de contacto de `/acerca` envía correos con [Resend](https://resend.com). Copia `.env.template` a `.env.local` en la raíz (no se versiona) y rellena:

```bash
RESEND_API_KEY=re_xxxxxxxx                              # API key de Resend
CONTACT_FROM_EMAIL="Arcade Vault <onboarding@resend.dev>" # remitente
CONTACT_TO_EMAIL=equipo@ejemplo.com                     # buzón que recibe los mensajes
```

- El correo llega a `CONTACT_TO_EMAIL` y su reply-to es el correo que escribió el usuario.
- Con `onboarding@resend.dev` como remitente, Resend **solo entrega al correo del dueño de la cuenta**: en desarrollo, `CONTACT_TO_EMAIL` debe ser ese correo.
- En producción hace falta un dominio verificado en Resend y un `CONTACT_FROM_EMAIL` de ese dominio.
- Sin estas variables la app compila y funciona; el formulario muestra un error al enviar y el servidor registra qué variable falta.