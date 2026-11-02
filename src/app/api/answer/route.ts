import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { answer } from "@/lib/game";
import { PLAYER_COOKIE } from "@/lib/server";

export async function POST(req: Request) {
  const { index, choice } = await req.json();
  const token = (await cookies()).get(PLAYER_COOKIE)?.value;
  return NextResponse.json({ ok: answer(token, index, choice) });
}
