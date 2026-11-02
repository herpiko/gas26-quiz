"use client";

import { type CSSProperties, useEffect, useState } from "react";
import type { BoardRow } from "@/lib/game";

export const LETTERS = ["A", "B", "C", "D"];

export function post(url: string, body?: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

// Bump `epoch` to reconnect, which is needed after the session cookie changes.
export function useStream<T>(url: string, epoch: number) {
  const [data, setData] = useState<T | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let source: EventSource;
    let retry: ReturnType<typeof setTimeout>;

    const connect = () => {
      source = new EventSource(url);
      source.onopen = () => setOnline(true);
      source.onmessage = (event) => setData(JSON.parse(event.data));
      source.onerror = () => {
        setOnline(false);
        // The browser only retries by itself after a dropped connection, not
        // after an error response such as a proxy 502 during a restart.
        if (source.readyState === EventSource.CLOSED) retry = setTimeout(connect, 2000);
      };
    };
    connect();

    return () => {
      clearTimeout(retry);
      source.close();
    };
  }, [url, epoch]);

  return { data, online };
}

export function Leaderboard({
  rows,
  total,
  highlight,
}: {
  rows: BoardRow[];
  total: number;
  highlight?: string;
}) {
  if (rows.length === 0) return <p className="muted">No participants.</p>;
  return (
    <section className="stack">
      <h2>Top 10</h2>
      <ol className="board">
        {rows.map((row) => (
          <li key={row.id} className={row.id === highlight ? "me" : undefined}>
            <span className="rank">{row.rank}</span>
            <span className="name">{row.nickname}</span>
            <span className="score">{row.score}</span>
            <span className="track" aria-hidden="true">
              <img
                className="turtle"
                src="/turtle.png"
                alt=""
                width={185}
                height={192}
                style={
                  { "--from": row.previous / total, "--to": row.score / total } as CSSProperties
                }
              />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Offline({ online }: { online: boolean }) {
  return online ? null : <p className="offline">Reconnecting…</p>;
}
