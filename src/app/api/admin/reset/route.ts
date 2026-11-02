import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin, reset } from "@/lib/game";
import { ADMIN_COOKIE } from "@/lib/server";

export async function POST() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isAdmin(token)) return NextResponse.json({ ok: false }, { status: 401 });
  reset();
  return NextResponse.json({ ok: true });
}
