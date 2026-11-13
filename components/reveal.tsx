"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sección que aparece al entrar en pantalla: añade `in` a `.reveal`.
 * Sin IntersectionObserver se muestra de inmediato; con movimiento
 * reducido el CSS la deja visible sin animación.
 */
export function Reveal({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={"reveal " + className}>
      {children}
    </section>
  );
}
