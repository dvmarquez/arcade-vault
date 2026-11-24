"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bloque que aparece al entrar en pantalla: añade `in` a `.reveal`.
 * Sin IntersectionObserver se muestra de inmediato; con movimiento
 * reducido el CSS lo deja visible sin animación.
 */
export function Reveal({
  as: Tag = "section",
  className,
  children,
  "aria-hidden": ariaHidden,
}: {
  as?: "section" | "div";
  className: string;
  children: ReactNode;
  "aria-hidden"?: boolean;
}) {
  // HTMLDivElement no añade nada usado aquí y su ref también sirve para <section>.
  const ref = useRef<HTMLDivElement>(null);

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
    <Tag ref={ref} className={"reveal " + className} aria-hidden={ariaHidden}>
      {children}
    </Tag>
  );
}
