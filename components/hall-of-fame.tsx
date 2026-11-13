"use client";

import Link from "next/link";
import { useState } from "react";
import { GAMES, seededScores, type ScoreRow } from "@/lib/games";
import { useSession } from "@/lib/session";

const TOP_CLASS = [" top1", " top2", " top3"];
const fmt = (n: number) => n.toLocaleString("es-ES");
const pad2 = (n: number) => String(n).padStart(2, "0");

function PodiumSlot({ row, place }: { row: ScoreRow; place: "gold" | "silver" | "bronze" }) {
  const gold = place === "gold";
  return (
    <div className={"podium-slot " + place}>
      {gold && (
        <div className="pixel" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em" }}>
          CAMPEÓN
        </div>
      )}
      <div className="rank-num" style={gold ? { fontSize: 36, marginTop: 4 } : undefined}>
        {pad2(row.rank)}
      </div>
      <div className="name">{row.name}</div>
      <div className="score" style={gold ? { fontSize: 20 } : undefined}>
        {fmt(row.score)}
      </div>
      <div className="date">{row.date}</div>
    </div>
  );
}

export function HallOfFame() {
  const { user, scores } = useSession();
  const [tab, setTab] = useState(GAMES[0].id);
  const game = GAMES.find((g) => g.id === tab) ?? GAMES[0];
  const rows = seededScores(tab.length * 23 + 7, 12);

  // Mejor marca guardada (av_scores) del usuario actual para el juego seleccionado.
  const best = user
    ? scores
        .filter((s) => s.game === tab && s.name === user.name)
        .reduce<(typeof scores)[number] | null>((a, s) => (a && a.score >= s.score ? a : s), null)
    : null;
  const bestRank = best ? rows.filter((r) => r.score > best.score).length + 1 : 0;

  return (
    <div className="av-hall fade-in">
      <div className="hall-head">
        <h1>SALÓN DE LA FAMA</h1>
        <p className="pixel" style={{ fontSize: 10 }}>
          LOS NOMBRES QUE NUNCA SE BORRAN DE LA PANTALLA
        </p>
      </div>

      <div className="hall-tabs">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={"chip" + (tab === g.id ? " active" : "")}
            aria-pressed={tab === g.id}
            onClick={() => setTab(g.id)}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div className="podium">
        <PodiumSlot row={rows[1]} place="silver" />
        <PodiumSlot row={rows[0]} place="gold" />
        <PodiumSlot row={rows[2]} place="bronze" />
      </div>

      <div className="hall-table">
        <div className="th">
          <div>RANGO</div>
          <div>JUGADOR</div>
          <div>PUNTUACIÓN</div>
          <div>FECHA</div>
        </div>
        {rows.map((r, i) => (
          <div
            key={tab + r.name}
            className={"tr" + (TOP_CLASS[i] ?? "")}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rk">#{pad2(r.rank)}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{fmt(r.score)}</div>
            <div className="dt">{r.date}</div>
          </div>
        ))}
        {user && best && (
          <>
            <div className="tr you-label">▸ TU MEJOR MARCA EN {game.title}</div>
            <div className="tr you" style={{ animationDelay: `${rows.length * 50 + 50}ms` }}>
              <div className="rk" style={{ color: "var(--yellow)" }}>
                #{pad2(bestRank)}
              </div>
              <div className="pl" style={{ color: "var(--yellow)" }}>
                {user.name}
              </div>
              <div className="sc" style={{ color: "var(--yellow)", textShadow: "0 0 6px rgba(245,255,0,0.5)" }}>
                {fmt(best.score)}
              </div>
              <div className="dt">
                {new Date(best.at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Link href="/juegos" className="btn lg">
          VOLVER A LA BIBLIOTECA
        </Link>
      </div>
    </div>
  );
}
