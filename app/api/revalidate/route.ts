import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * On-demand revalidation (Part 2.3). POST, protected by a shared secret, called
 * by admin mutations with the paths/tags to purge.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorised" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { paths?: string[]; tags?: string[] };
  for (const path of body.paths ?? []) revalidatePath(path);
  for (const tag of body.tags ?? []) revalidateTag(tag);
  return NextResponse.json({ ok: true, revalidated: { paths: body.paths ?? [], tags: body.tags ?? [] } });
}
