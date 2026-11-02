import { cookies } from "next/headers";
import { playerView } from "@/lib/game";
import { PLAYER_COOKIE, stream } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = (await cookies()).get(PLAYER_COOKIE)?.value;
  return stream(req, () => playerView(token));
}
