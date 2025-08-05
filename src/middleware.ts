
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
  const trainerProtectedPaths = ["/dashboard", "/students", "/workouts", "/schedule", "/exercises", "/templates", "/settings"];
  if (!session && trainerProtectedPaths.some(p => pathname.startsWith(p))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated trainers from public auth pages
  const publicAuthPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (session && publicAuthPaths.some(p => pathname.startsWith(p))) {
    // Exception: Allow access to reset-password if there's a recovery token,
    // as the user might be logged in on one device but trying to reset from another.
    if (pathname === '/reset-password' && request.nextUrl.searchParams.has('code')) {
        return response;
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect student portal route
  if (pathname.startsWith('/public/student/') && pathname.endsWith('/portal')) {
      const studentId = pathname.split('/')[3];
      const isAuthenticated = request.cookies.get(`student-${studentId}-auth`)?.value === "true";
      
      const { data: student } = await supabase.from('students').select('access_password').eq('id', studentId).single();

      // If student has a password and is not authenticated, redirect to login page for the student portal
      if (student?.access_password && !isAuthenticated) {
         const studentLoginPage = new URL(pathname.replace('/portal', ''), request.url);
         return NextResponse.redirect(studentLoginPage);
      }
  }


  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/students/:path*", 
    "/workouts/:path*", 
    "/templates/:path*",
    "/schedule/:path*", 
    "/exercises/:path*", 
    "/settings",
    "/login", 
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/public/workout/:path*",
    "/public/student/:path*"
],
};
