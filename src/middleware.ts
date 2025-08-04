
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Protect authenticated routes for trainers
  const trainerProtectedPaths = ["/dashboard", "/students", "/workouts", "/schedule", "/exercises"];
  if (!session && trainerProtectedPaths.some(p => pathname.startsWith(p))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated trainers from login/signup
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect student portal route
  if (pathname.startsWith('/public/student/') && pathname.endsWith('/portal')) {
      const studentId = pathname.split('/')[3];
      const isAuthenticated = request.cookies.get(`student-${studentId}-auth`)?.value === "true";
      if (!isAuthenticated) {
          return NextResponse.redirect(new URL(`/public/student/${studentId}`, request.url));
      }
  }


  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/students/:path*", 
    "/workouts/:path*", 
    "/schedule/:path*", 
    "/exercises/:path*", 
    "/login", 
    "/signup", 
    "/auth/callback",
    "/public/workout/:path*",
    "/public/student/:path*"
],
};
