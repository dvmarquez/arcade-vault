import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GamePlayer } from "@/components/game-player";
import { GAMES, getGame } from "@/lib/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/juegos/[id]/jugar">): Promise<Metadata> {
  const { id } = await params;
  const game = getGame(id);
  return { title: game ? `Jugando ${game.title}` : "Juego no encontrado" };
}

// Igual que en Detalle: params se lee dentro de <Suspense> para no atar el App Shell a una URL.
export default function PlayPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<div className="av-player" aria-busy="true" />}>
      <Player params={params} />
    </Suspense>
  );
}

async function Player({ params }: Pick<PageProps<"/juegos/[id]/jugar">, "params">) {
  const { id } = await params;
  const game = getGame(id);
  if (!game) notFound();
  return <GamePlayer game={game} />;
}
