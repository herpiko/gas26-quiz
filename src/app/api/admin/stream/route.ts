import { cookies } from "next/headers";
import { adminView } from "@/lib/game";
import { ADMIN_COOKIE, stream } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return stream(req, () => adminView(token));
}
