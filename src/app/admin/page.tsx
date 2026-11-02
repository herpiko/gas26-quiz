"use client";

import { type CSSProperties, type FormEvent, useEffect, useState } from "react";
import type { AdminView } from "@/lib/game";
import { LETTERS, Leaderboard, Offline, post, useStream } from "../client";

type Authed = Extract<AdminView, { authed: true }>;

export default function AdminPage() {
  const [epoch, setEpoch] = useState(0);
  const { data, online } = useStream<AdminView>("/api/admin/stream", epoch);

  return (
    <main className="page wide">
      <Offline online={online} />
      {data === null ? (
        <p className="muted center">Loading…</p>
      ) : data.authed ? (
        <Console view={data} />
      ) : (
        <LoginForm onLogin={() => setEpoch((value) => value + 1)} />
      )}
    </main>
  );
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const res = await post("/api/admin/login", { passphrase }).catch(() => null);
    if (res?.ok) onLogin();
    else setError((await res?.json())?.error ?? "Could not reach the server.");
  }

  return (
    <form className="card stack narrow" onSubmit={submit}>
      <h1>Quiz admin</h1>
      <label>
        Passphrase
        <input
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary">Enter</button>
    </form>
  );
}

function nextLabel(view: Authed) {
  if (view.phase === "lobby") return "Start quiz";
  if (view.phase === "question") return "Check score";
  return view.index + 1 < view.total ? "Next question" : "Show final scores";
}

function Console({ view }: { view: Authed }) {
  const [busy, setBusy] = useState(false);

  async function next() {
    setBusy(true);
    await post("/api/admin/advance", { step: view.step }).catch(() => null);
    setBusy(false);
  }

  function restart() {
    if (confirm("Start over? This removes all players and scores.")) post("/api/admin/reset");
  }

  return (
    <div className="stack">
      <Stage view={view} />
      <div className="controls">
        <button className="ghost" onClick={restart}>
          Start over
        </button>
        {view.phase !== "final" && (
          <button className="primary" disabled={busy} onClick={next}>
            {nextLabel(view)}
          </button>
        )}
      </div>
      <img className="qr" src="/qr.png" alt="QR code to join the quiz" width={411} height={410} />
    </div>
  );
}

const CONFETTI_COLORS = [
  "#e01b24",
  "#ff7800",
  "#f6d32d",
  "#33d17a",
  "#14f1c5",
  "#3584e4",
  "#9141ac",
  "#ff5fa2",
];

// A party popper in each bottom corner, firing towards the middle.
function confettiPiece(i: number) {
  const fromLeft = i % 2 === 0;
  const spread = 15 + Math.random() * 65;
  return {
    left: fromLeft ? 0 : "100%",
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animationDelay: `${Math.random() * 0.3}s`,
    animationDuration: `${1.9 + Math.random() * 0.8}s`,
    "--x": `${fromLeft ? spread : -spread}vw`,
    "--y": `${-(50 + Math.random() * 50)}vh`,
    "--spin": `${180 + Math.random() * 540}deg`,
  } as CSSProperties;
}

function Confetti() {
  const [pieces] = useState(() => Array.from({ length: 180 }, (_, i) => confettiPiece(i)));
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (done) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} style={style} />
      ))}
    </div>
  );
}

function Stage({ view }: { view: Authed }) {
  const count = view.nicknames.length;

  switch (view.phase) {
    case "lobby":
      return (
        <div className="stack center">
          <h1 className="display">GAS26 Quiz</h1>
          <p className="muted">{count} ready</p>
          <ul className="chips">
            {view.nicknames.map((nickname) => (
              <li key={nickname}>{nickname}</li>
            ))}
          </ul>
        </div>
      );
    case "question":
      return (
        <div className="stack center">
          <p className="muted">
            Question {view.index + 1} of {view.total}
          </p>
          <h1 className="display">{view.questionText}</h1>
          <p className="muted">
            {view.answered} of {count} answered
          </p>
        </div>
      );
    case "score":
      return (
        <div className="stack">
          <Confetti key={view.step} />
          <div className="stack center">
            <p className="muted">
              Question {view.index + 1} of {view.total}
            </p>
            <h1>{view.questionText}</h1>
            <p className="answer">
              {view.reveal && LETTERS[view.reveal.correct]}) {view.reveal?.correctText}
            </p>
            {view.reveal?.note && <p className="muted">{view.reveal.note}</p>}
          </div>
          <Leaderboard rows={view.board ?? []} total={view.total} />
        </div>
      );
    case "final":
      return (
        <div className="stack">
          <h1 className="display center">Final scores</h1>
          <Leaderboard rows={view.board ?? []} total={view.total} />
        </div>
      );
  }
}
