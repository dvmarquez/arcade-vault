"use server";

import { Resend } from "resend";

export type ContactState =
  | { status: "idle" }
  | { status: "sent"; name: string }
  | { status: "error"; message: string };

// Límites compartidos con los maxLength de components/contact-form.tsx.
const MAX_NAME = 40;
const MAX_EMAIL = 254;
const MAX_MSG = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVALID = "✖ REVISA LOS CAMPOS E INTÉNTALO DE NUEVO.";
const FAILED = "✖ NO SE PUDO ENVIAR EL MENSAJE. INTÉNTALO MÁS TARDE.";

/** Campo de texto del FormData; cualquier otra cosa (ausente o File) cuenta como vacío. */
function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Envía el mensaje del formulario de contacto al equipo con Resend.
 * Es un endpoint público: toda la validación se repite aquí aunque el cliente ya la haga.
 */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // El nombre va en el asunto: los saltos de línea de una petición forzada se aplanan.
  const name = field(formData, "name").replace(/\s+/g, " ");
  const email = field(formData, "email");
  const msg = field(formData, "msg");

  // Honeypot: éxito silencioso para que el bot no sepa que fue detectado.
  if (field(formData, "website")) return { status: "sent", name };

  const valid =
    name.length >= 1 &&
    name.length <= MAX_NAME &&
    email.length >= 3 &&
    email.length <= MAX_EMAIL &&
    EMAIL_RE.test(email) &&
    msg.length >= 1 &&
    msg.length <= MAX_MSG;
  if (!valid) return { status: "error", message: INVALID };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !from || !to) {
    const missing = [!apiKey && "RESEND_API_KEY", !from && "CONTACT_FROM_EMAIL", !to && "CONTACT_TO_EMAIL"]
      .filter(Boolean)
      .join(", ");
    console.error(`[contacto] Faltan variables de entorno: ${missing}`);
    return { status: "error", message: FAILED };
  }

  try {
    // Se crea aquí y no a nivel de módulo para que el build no dependa de la clave.
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}\n`,
    });
    if (error) {
      console.error("[contacto] Resend devolvió un error:", error);
      return { status: "error", message: FAILED };
    }
  } catch (err) {
    console.error("[contacto] Fallo al llamar a Resend:", err);
    return { status: "error", message: FAILED };
  }

  return { status: "sent", name };
}
