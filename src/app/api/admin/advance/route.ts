import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { advance, isAdmin } from "@/lib/game";
import { ADMIN_COOKIE } from "@/lib/server";

export async function POST(req: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdmin(token)) return NextResponse.json({ ok: false }, { status: 401 });
  const { step } = await req.json();
  return NextResponse.json({ ok: advance(step) });
}
