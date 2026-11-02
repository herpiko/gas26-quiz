import { NextResponse } from "next/server";
import { login } from "@/lib/game";
import { ADMIN_COOKIE, withCookie } from "@/lib/server";

export async function POST(req: Request) {
  const { passphrase } = await req.json();
  const token = login(String(passphrase ?? ""));
  if (!token) return NextResponse.json({ error: "Wrong passphrase." }, { status: 401 });
  return withCookie(req, ADMIN_COOKIE, token);
}
