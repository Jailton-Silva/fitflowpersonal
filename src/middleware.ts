
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./lib/supabase/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Protect authenticated trainer routes
  const trainerProtectedPaths = ["/dashboard", "/students", "/workouts", "/schedule", "/exercises", "/templates", "/settings", "/billing", "/admin"];
  if (!session && trainerProtectedPaths.some(p => pathname.startsWith(p))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated trainers from public auth pages
  const publicAuthPaths = ["/login", "/signup", "/forgot", "/reset-password"];
  if (session && publicAuthPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle student portal access.
  // This logic is now simpler: if you're going to the main portal page without a session,
  // we let it through, as that page handles the login.
  // If you're trying to access a sub-page of a portal, the page itself will validate the cookie.
  // This avoids complex middleware logic.

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json).*)',
],
};
