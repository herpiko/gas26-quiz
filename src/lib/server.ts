import { NextResponse } from "next/server";
import { changes } from "./game";

export const PLAYER_COOKIE = "gas26_player";
export const ADMIN_COOKIE = "gas26_admin";

export function withCookie(req: Request, name: string, value: string) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.headers.get("x-forwarded-proto") === "https",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}

// Streams `view()` to the client now and after every game change, skipping
// updates that would not change what this client already has.
export function stream(req: Request, view: () => unknown) {
  const encoder = new TextEncoder();
  let stop = () => {};

  const body = new ReadableStream({
    start(controller) {
      let last = "";
      const send = () => {
        const json = JSON.stringify(view());
        if (json === last) return;
        last = json;
        controller.enqueue(encoder.encode(`data: ${json}\n\n`));
      };
      const ping = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 15000);

      stop = () => {
        clearInterval(ping);
        changes.off("change", send);
      };
      changes.on("change", send);
      req.signal.addEventListener("abort", () => {
        stop();
        controller.close();
      });
      send();
    },
    cancel() {
      stop();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
