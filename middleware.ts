import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Global middleware (Part 6.3):
 *  - Refreshes the Supabase session on every request.
 *  - `/admin/*` requires staff; non-staff get a 404 (the surface is not
 *    advertised). The definitive check is re-run in every admin route/action.
 *  - `/account/*` requires a session; redirect to /login?next=.
 *
 * Authorisation is never done in middleware alone.
 */
export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account") && !pathname.startsWith("/account/track");

  if (!supabase) {
    // Supabase not configured (preview/build) — allow rendering the shells.
    return response;
  }

  if (isAccount && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin) {
    if (!user) return NextResponse.rewrite(new URL("/not-found", request.url));
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = profile?.role as string | undefined;
    const isStaff = role === "staff" || role === "admin" || role === "super_admin";
    if (!isStaff) return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)"],
};
