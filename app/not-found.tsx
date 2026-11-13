import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Juego no encontrado",
};

export default function NotFound() {
  return (
    <div className="fade-in mx-auto flex max-w-xl flex-col items-center gap-8 px-4 py-16 text-center">
      <div className="crt w-full">
        <div className="crt-screen">
          <div className="crt-content flex-col gap-6">
            <div
              className="neon-magenta flicker motion-reduce:animate-none"
              style={{ fontSize: "clamp(48px, 14vw, 96px)", letterSpacing: "0.08em" }}
            >
              404
            </div>
            <div className="neon-cyan" style={{ fontSize: "clamp(9px, 2.4vw, 12px)", letterSpacing: "0.16em" }}>
              CARTUCHO NO ENCONTRADO{" "}
              <span className="motion-reduce:animate-none" style={{ animation: "blink 1.2s steps(1,end) infinite" }}>
                _
              </span>
            </div>
          </div>
        </div>
        <div className="crt-bottom">
          <span>CANAL 404</span>
          <span>SIN SEÑAL</span>
        </div>
      </div>

      <p className="mono max-w-md" style={{ color: "var(--ink-dim)", fontSize: 14, lineHeight: 1.7 }}>
        Esta dirección no lleva a ningún juego del vault. Puede que el enlace esté mal escrito o que el juego ya no
        exista.
      </p>

      <Link href="/" className="btn">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
