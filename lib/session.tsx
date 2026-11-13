"use client";

import { createContext, use, useSyncExternalStore, type ReactNode } from "react";

export interface User {
  name: string;
}

export interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

interface SessionState {
  user: User | null;
  scores: SavedScore[];
}

interface Session extends SessionState {
  login: (user: User) => void;
  logout: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

// ---------- Store sobre localStorage ----------
// El servidor (y la hidratación) siempre ven EMPTY; el cliente lee localStorage
// después vía useSyncExternalStore, así no hay desajustes de hidratación.

const EMPTY: SessionState = { user: null, scores: [] };

let state: SessionState | null = null;
const listeners = new Set<() => void>();

function readJSON(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    // localStorage no disponible o JSON corrupto.
    return null;
  }
}

function isUser(v: unknown): v is User {
  return typeof v === "object" && v !== null && typeof (v as User).name === "string";
}

function isSavedScore(v: unknown): v is SavedScore {
  if (typeof v !== "object" || v === null) return false;
  const s = v as SavedScore;
  return (
    typeof s.game === "string" &&
    typeof s.score === "number" &&
    typeof s.name === "string" &&
    typeof s.at === "number"
  );
}

function readState(): SessionState {
  const user = readJSON(USER_KEY);
  const scores = readJSON(SCORES_KEY);
  return {
    user: isUser(user) ? user : null,
    scores: Array.isArray(scores) ? scores.filter(isSavedScore) : [],
  };
}

function writeStorage(write: (storage: Storage) => void) {
  try {
    write(window.localStorage);
  } catch {
    // Sin persistencia (modo privado, cuota llena): el estado en memoria sigue funcionando.
  }
}

function setState(next: SessionState) {
  state = next;
  listeners.forEach((l) => l());
}

function getSnapshot(): SessionState {
  return (state ??= readState());
}

function getServerSnapshot(): SessionState {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Sincroniza cambios hechos desde otras pestañas.
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === USER_KEY || e.key === SCORES_KEY) setState(readState());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function login(user: User) {
  writeStorage((s) => s.setItem(USER_KEY, JSON.stringify(user)));
  setState({ ...getSnapshot(), user });
}

function logout() {
  writeStorage((s) => s.removeItem(USER_KEY));
  setState({ ...getSnapshot(), user: null });
}

function saveScore(entry: Omit<SavedScore, "at">) {
  const scores = [...getSnapshot().scores, { ...entry, at: Date.now() }];
  writeStorage((s) => s.setItem(SCORES_KEY, JSON.stringify(scores)));
  setState({ ...getSnapshot(), scores });
}

// ---------- Provider / hook ----------

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, scores } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <SessionContext value={{ user, scores, login, logout, saveScore }}>{children}</SessionContext>
  );
}

export function useSession(): Session {
  const session = use(SessionContext);
  if (!session) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return session;
}
