import type { Metadata } from "next";
import Link from "next/link";
import { FeatureIcon, type FeatureIconKind } from "@/components/feature-icon";
import { FloatingSilhouettes } from "@/components/floating-silhouettes";
import { MiniCard } from "@/components/mini-card";
import { GAMES, getGame, type NeonColor } from "@/lib/games";
import { RECENT_SCORES, TOP_PLAYERS } from "@/lib/home";

export const metadata: Metadata = {
  // title.template del layout no aplica al segmento raíz: se escribe completo.
  title: "Arcade Vault · El arcade clásico está de vuelta",
};

const FEATURES: { i: FeatureIconKind; t: string; d: string; c: NeonColor }[] = [
  {
    i: "GAMEPAD",
    t: "JUEGOS CLÁSICOS",
    d: "Bloque Buster, Caída, Serpentina y muchos más. Los mejores arcades de todos los tiempos en un solo lugar.",
    c: "cyan",
  },
  {
    i: "FREE",
    t: "100% GRATIS",
    d: "Sin suscripciones, sin pagos ocultos. Todos los juegos disponibles de forma gratuita.",
    c: "yellow",
  },
  {
    i: "TROPHY",
    t: "LADDER BOARDS",
    d: "Compite con jugadores de todo el mundo. Escala el ranking y demuestra quién es el mejor.",
    c: "magenta",
  },
  {
    i: "ROCKET",
    t: "SIEMPRE CRECIENDO",
    d: "Agregamos nuevos juegos constantemente. Vuelve seguido, siempre habrá algo nuevo que jugar.",
    c: "green",
  },
];

const STATS = [
  { n: String(GAMES.length), u: "JUEGOS", s: "Y CONTANDO" },
  { n: "MILES", u: "DE PARTIDAS", s: "JUGADAS CADA DÍA" },
  { n: "GLOBAL", u: "RANKING", s: "COMPITE CON EL MUNDO" },
];

export default function Home() {
  return (
    <div className="home fade-in">
      <section className="home-hero">
        <FloatingSilhouettes />
        <div className="home-hero-inner">
          <div className="hero-eyebrow pixel neon-yellow">
            ▸ INSERTA UNA MONEDA<span className="blink">_</span>
          </div>
          <h1 className="home-title">
            <span className="line-1">EL ARCADE</span>
            <span className="line-2">CLÁSICO ESTÁ</span>
            <span className="line-3">DE VUELTA</span>
          </h1>
          <p className="home-sub">
            Juega los mejores clásicos directamente en tu navegador.
            <br />
            Sin descargas. Sin costo. Solo diversión.
          </p>
          <div className="home-ctas">
            <Link href="/juegos" className="btn xl pulse">
              ▶&nbsp;&nbsp;EXPLORAR JUEGOS
            </Link>
            <Link href="/auth?modo=registro" className="btn xl magenta">
              ✦&nbsp;&nbsp;CREAR CUENTA
            </Link>
          </div>
          <div className="hero-scroll" aria-hidden="true">
            <span>DESLIZA</span>
            <span className="arrow">▼</span>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="kicker pixel neon-magenta">{"// 01"}</div>
          <h2 className="section-title">¿POR QUÉ ARCADE VAULT?</h2>
          <div className="section-rule" />
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={f.t} className={"feature-card " + f.c} style={{ transitionDelay: i * 80 + "ms" }}>
              <FeatureIcon kind={f.i} />
              <div className="ft-title pixel">{f.t}</div>
              <div className="ft-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="kicker pixel neon-cyan">{"// 02"}</div>
          <h2 className="section-title">JUEGOS DISPONIBLES AHORA</h2>
          <div className="section-rule" />
        </div>
        <div className="mini-rail">
          {GAMES.slice(0, 6).map((g) => (
            <MiniCard key={g.id} game={g} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/juegos" className="btn lg">
            VER TODOS LOS JUEGOS →
          </Link>
        </div>
      </section>

      <section className="home-stats">
        <div className="stats-inner">
          {STATS.map((st, i) => (
            <div key={st.u} className="stat-block" style={{ transitionDelay: i * 90 + "ms" }}>
              <div className="stat-n neon-yellow">{st.n}</div>
              <div className="stat-u pixel">{st.u}</div>
              <div className="stat-s">{st.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div className="kicker pixel neon-yellow">{"// 03"}</div>
          <h2 className="section-title">ACTIVIDAD EN VIVO</h2>
          <div className="section-rule" />
        </div>
        <div className="activity-grid">
          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel">▸ ÚLTIMAS PUNTUACIONES</div>
            </div>
            <div className="ticker">
              {RECENT_SCORES.map((r, i) => (
                <div key={r.player + r.gameId} className="tick-row" style={{ animationDelay: i * 60 + "ms" }}>
                  <span className={"tk-p neon-" + r.color}>{r.player}</span>
                  <span className="tk-mid">▸ {getGame(r.gameId)?.title}</span>
                  <span className="tk-s">+{r.score.toLocaleString("es-ES")}</span>
                  <span className="tk-t">{r.ago}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-card">
            <div className="ac-head">
              <div className="ac-title pixel neon-magenta">▸ TOP JUGADORES · HOY</div>
              <Link href="/salon" className="lb-link">
                VER SALÓN →
              </Link>
            </div>
            <div className="top-list">
              {TOP_PLAYERS.map((r, i) => (
                <div key={r.rank} className={"top-row" + (i < 3 ? ` top${i + 1}` : "")}>
                  <span className="tp-rk">#{String(r.rank).padStart(2, "0")}</span>
                  <span className="tp-bar">
                    <span className="tp-fill" style={{ width: 100 - i * 16 + "%" }} />
                  </span>
                  <span className="tp-p">{r.player}</span>
                  <span className="tp-s">{r.score.toLocaleString("es-ES")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
