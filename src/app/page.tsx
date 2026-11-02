"use client";

import { type FormEvent, useState } from "react";
import type { PlayerView } from "@/lib/game";
import { LETTERS, Leaderboard, Offline, post, useStream } from "./client";

type Joined = Extract<PlayerView, { joined: true }>;

export default function PlayerPage() {
  const [epoch, setEpoch] = useState(0);
  const { data, online } = useStream<PlayerView>("/api/stream", epoch);

  return (
    <main className="page">
      <Offline online={online} />
      {data === null ? (
        <p className="muted center">Loading…</p>
      ) : data.joined ? (
        <Game view={data} />
      ) : (
        <JoinForm onJoined={() => setEpoch((value) => value + 1)} />
      )}
    </main>
  );
}

function JoinForm({ onJoined }: { onJoined: () => void }) {
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await post("/api/join", { code, nickname }).catch(() => null);
    setBusy(false);
    if (res?.ok) onJoined();
    else setError((await res?.json())?.error ?? "Could not reach the server.");
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <h1>GAS26 Quiz</h1>
      <label>
        Session code
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          required
        />
      </label>
      <label>
        Nickname
        <input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          autoComplete="off"
          maxLength={20}
          required
        />
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>
        Join
      </button>
    </form>
  );
}

function Game({ view }: { view: Joined }) {
  switch (view.phase) {
    case "lobby":
      return (
        <div className="card stack center">
          <h1>You're in, {view.nickname}!</h1>
          <p className="muted">Waiting for the host to begin…</p>
        </div>
      );
    case "question":
      return <QuestionScreen key={view.index} view={view} />;
    case "score":
      return <ScoreScreen view={view} />;
    case "final":
      return <FinalScreen view={view} />;
  }
}

function Progress({ view }: { view: Joined }) {
  return (
    <p className="muted">
      Question {view.index + 1} of {view.total}
    </p>
  );
}

function QuestionScreen({ view }: { view: Joined }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const chosen = selected ?? view.choice;

  // One request at a time, so a slow earlier pick can't overwrite a later one.
  async function choose(choice: number) {
    setSelected(choice);
    setBusy(true);
    const res = await post("/api/answer", { index: view.index, choice }).catch(() => null);
    const saved = res?.ok && (await res.json()).ok;
    if (!saved) setSelected(null);
    setBusy(false);
  }

  return (
    <div className="stack">
      <Progress view={view} />
      <h1>{view.question?.text}</h1>
      <div className="options">
        {view.question?.options.map((option, i) => (
          <button
            key={i}
            className={`option${chosen === i ? " chosen" : ""}`}
            disabled={busy}
            onClick={() => choose(i)}
          >
            <span className="letter">{LETTERS[i]}</span>
            {option}
          </button>
        ))}
      </div>
      {chosen !== null && (
        <p className="muted center">You can change your answer until the host checks the score.</p>
      )}
    </div>
  );
}

function ScoreScreen({ view }: { view: Joined }) {
  const { reveal, choice, me } = view;
  const verdict =
    choice === null ? "No answer" : choice === reveal?.correct ? "Correct!" : "Not quite";

  return (
    <div className="stack">
      <Progress view={view} />
      <div className="card stack center">
        <h1>{verdict}</h1>
        <p>
          Answer: <strong>{reveal?.correctText}</strong>
        </p>
        {reveal?.note && <p className="muted">{reveal.note}</p>}
        <p className="muted">
          You have {me?.score} point{me?.score === 1 ? "" : "s"}, rank {me?.rank}
        </p>
      </div>
      <Leaderboard rows={view.board ?? []} total={view.total} highlight={view.id} />
    </div>
  );
}

function FinalScreen({ view }: { view: Joined }) {
  return (
    <div className="stack">
      <h1 className="center">Final scores</h1>
      <p className="muted center">
        You finished with {view.me?.score} point{view.me?.score === 1 ? "" : "s"}, rank {view.me?.rank}
      </p>
      <Leaderboard rows={view.board ?? []} total={view.total} highlight={view.id} />
    </div>
  );
}
