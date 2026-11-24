"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { sendContact, type ContactState } from "@/app/acerca/actions";

const EMPTY = { name: "", email: "", msg: "" };
const IDLE: ContactState = { status: "idle" };

/**
 * Formulario de contacto de /acerca. "ENVIAR OTRO MENSAJE" remonta el formulario
 * con una key nueva: así vuelven a vacío tanto los campos como el estado de la acción.
 */
export function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormRound key={round} onReset={() => setRound((r) => r + 1)} />;
}

function ContactFormRound({ onReset }: { onReset: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const [shake, setShake] = useState(false);
  const [state, dispatch, pending] = useActionState(sendContact, IDLE);
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(shakeTimer.current), []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Despacho manual en vez de action={dispatch}: evita el reseteo automático de
    // React 19 (los campos se conservan si falla) y no llega nada al servidor si hay vacíos.
    e.preventDefault();
    if (pending) return;
    if (!form.name.trim() || !form.email.trim() || !form.msg.trim()) {
      setShake(true);
      clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => setShake(false), 400);
      return;
    }
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };

  return (
    <form className={"contact-form" + (shake ? " shake" : "")} onSubmit={onSubmit}>
      {state.status !== "sent" ? (
        <>
          <div className="field">
            <label htmlFor="contact-name">NOMBRE</label>
            <input
              id="contact-name"
              name="name"
              maxLength={40}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="px_kai"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-email">CORREO ELECTRÓNICO</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jugador@vault.gg"
            />
          </div>
          <div className="field">
            <label htmlFor="contact-msg">MENSAJE</label>
            <textarea
              id="contact-msg"
              name="msg"
              rows={5}
              maxLength={2000}
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
              placeholder="Cuéntanos qué tienes en mente…"
            />
          </div>
          {/* Honeypot: invisible para personas; si un bot lo rellena, el servidor no envía nada. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
            <label htmlFor="contact-website">WEBSITE</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
          <button className="btn xl press" type="submit" disabled={pending} style={{ width: "100%" }}>
            {pending ? "▶ TRANSMITIENDO…" : "▶  ENVIAR MENSAJE"}
          </button>
          {state.status === "error" && !pending && (
            <p className="contact-error" role="alert">
              {state.message}
            </p>
          )}
        </>
      ) : (
        <div className="terminal-success" role="status">
          <div className="term-bar">
            <span className="dot r" />
            <span className="dot y" />
            <span className="dot g" />
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line">
              <span className="prompt">vault@arcade:~$</span> ./send_message --to=team
            </div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {state.name.toUpperCase()}.
              <span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={onReset}>
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
