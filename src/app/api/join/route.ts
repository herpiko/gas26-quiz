import { NextResponse } from "next/server";
import { join } from "@/lib/game";
import { PLAYER_COOKIE, withCookie } from "@/lib/server";

export async function POST(req: Request) {
  const { code, nickname } = await req.json();
  const result = join(String(code ?? ""), String(nickname ?? ""));
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return withCookie(req, PLAYER_COOKIE, result.token);
}
