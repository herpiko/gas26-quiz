import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { QUESTIONS, SESSION_CODE } from "./quiz";

export type Phase = "lobby" | "question" | "score" | "final";

const TOP_RANKS = 10;

export type BoardRow = {
  id: string;
  nickname: string;
  score: number;
  // Where the player's turtle starts this screen's race.
  previous: number;
  rank: number;
};

export type Reveal = { correct: number; correctText: string; note?: string };

export type PlayerView =
  | { joined: false }
  | {
      joined: true;
      id: string;
      nickname: string;
      phase: Phase;
      index: number;
      total: number;
      question?: { text: string; options: string[] };
      choice: number | null;
      reveal?: Reveal;
      board?: BoardRow[];
      me?: BoardRow;
    };

export type AdminView =
  | { authed: false }
  | {
      authed: true;
      phase: Phase;
      step: number;
      index: number;
      total: number;
      questionText?: string;
      reveal?: Reveal;
      board?: BoardRow[];
      nicknames: string[];
      answered: number;
    };

type Answer = { choice: number; ms: number };

type Player = {
  id: string;
  token: string;
  nickname: string;
  answers: Map<number, Answer>;
};

type Game = {
  // Single counter for the whole flow, so a stale or doubled admin click can
  // never skip a screen: 0 = lobby, 1 = question 1, 2 = score 1, 3 = question 2,
  // ... and the step after the last score is the final screen.
  step: number;
  questionOpenedAt: number;
  players: Map<string, Player>;
  adminToken: string;
  changes: EventEmitter;
};

// Stored on globalThis because Next.js may load this module once per route.
const store = globalThis as typeof globalThis & { gas26Game?: Game };

function createGame(): Game {
  const changes = new EventEmitter();
  changes.setMaxListeners(0);
  return {
    step: 0,
    questionOpenedAt: 0,
    players: new Map(),
    adminToken: randomUUID(),
    changes,
  };
}

const game = (store.gas26Game ??= createGame());

export const changes = game.changes;

function notify() {
  game.changes.emit("change");
}

function position(): { phase: Phase; index: number } {
  const { step } = game;
  const index = Math.floor((step - 1) / 2);
  if (step === 0) return { phase: "lobby", index: 0 };
  if (step > QUESTIONS.length * 2) return { phase: "final", index: QUESTIONS.length - 1 };
  return { phase: step % 2 === 1 ? "question" : "score", index };
}

function revealFor(index: number): Reveal {
  const { correct, options, note } = QUESTIONS[index];
  return { correct, correctText: options[correct], note };
}

// One point per correct answer; equal scores are ranked by the total time
// taken on correct answers.
function leaderboard(): BoardRow[] {
  const { phase, index: current } = position();
  const totals = [...game.players.values()].map((player) => {
    let score = 0;
    let ms = 0;
    let gained = 0;
    for (const [index, answer] of player.answers) {
      if (answer.choice === QUESTIONS[index].correct) {
        score += 1;
        ms += answer.ms;
        if (index === current) gained = 1;
      }
    }
    // The final screen replays the whole race from the start line.
    const previous = phase === "final" ? 0 : score - gained;
    return { id: player.id, nickname: player.nickname, score, previous, ms };
  });
  totals.sort((a, b) => b.score - a.score || a.ms - b.ms);
  return totals.map(({ ms: _ms, ...row }, i) => ({ ...row, rank: i + 1 }));
}

export function join(code: string, nickname: string): { token: string } | { error: string } {
  const name = nickname.trim();
  if (code !== SESSION_CODE) return { error: "Wrong session code." };
  if (!name) return { error: "Please enter a nickname." };
  if (name.length > 20) return { error: "Nickname can be at most 20 characters." };

  const taken = [...game.players.values()].some(
    (player) => player.nickname.toLowerCase() === name.toLowerCase(),
  );
  if (taken) return { error: "That nickname is taken. Please pick another one." };

  const player: Player = {
    id: randomUUID(),
    token: randomUUID(),
    nickname: name,
    answers: new Map(),
  };
  game.players.set(player.token, player);
  notify();
  return { token: player.token };
}

export function answer(token: string | undefined, index: number, choice: number): boolean {
  const player = token ? game.players.get(token) : undefined;
  const current = position();
  if (!player || current.phase !== "question" || current.index !== index) return false;
  if (!Number.isInteger(choice) || choice < 0 || choice >= QUESTIONS[index].options.length) {
    return false;
  }
  if (player.answers.get(index)?.choice === choice) return true;
  player.answers.set(index, { choice, ms: Date.now() - game.questionOpenedAt });
  notify();
  return true;
}

export function login(passphrase: string): string | null {
  const expected = process.env.ADMIN_PASSPHRASE ?? "terenggnome26";
  return passphrase === expected ? game.adminToken : null;
}

export function isAdmin(token: string | undefined): boolean {
  return token === game.adminToken;
}

export function advance(fromStep: number): boolean {
  if (fromStep !== game.step || position().phase === "final") return false;
  game.step += 1;
  if (position().phase === "question") game.questionOpenedAt = Date.now();
  notify();
  return true;
}

export function reset() {
  game.step = 0;
  game.players.clear();
  notify();
}

export function playerView(token: string | undefined): PlayerView {
  const player = token ? game.players.get(token) : undefined;
  if (!player) return { joined: false };

  const { phase, index } = position();
  const showsQuestion = phase === "question" || phase === "score";
  const { text, options } = QUESTIONS[index];
  const board = phase === "score" || phase === "final" ? leaderboard() : undefined;
  return {
    joined: true,
    id: player.id,
    nickname: player.nickname,
    phase,
    index,
    total: QUESTIONS.length,
    // The correct answer stays on the server until the score screen.
    question: showsQuestion ? { text, options } : undefined,
    choice: showsQuestion ? (player.answers.get(index)?.choice ?? null) : null,
    reveal: phase === "score" ? revealFor(index) : undefined,
    board: board?.slice(0, TOP_RANKS),
    me: board?.find((row) => row.id === player.id),
  };
}

export function adminView(token: string | undefined): AdminView {
  if (!isAdmin(token)) return { authed: false };

  const { phase, index } = position();
  const players = [...game.players.values()];
  return {
    authed: true,
    phase,
    step: game.step,
    index,
    total: QUESTIONS.length,
    questionText: phase === "question" || phase === "score" ? QUESTIONS[index].text : undefined,
    reveal: phase === "score" ? revealFor(index) : undefined,
    board: phase === "score" || phase === "final" ? leaderboard().slice(0, TOP_RANKS) : undefined,
    nicknames: players.map((player) => player.nickname),
    answered: players.filter((player) => player.answers.has(index)).length,
  };
}
