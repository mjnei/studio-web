import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The refresh token cookie is scoped to /api/v1 (backend only),
  // so middleware cannot use it for auth checks. Auth redirects are
  // handled client-side by AuthProvider and AuthGuard.
  // Middleware only handles the ?next= param to preserve destination.
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Strip the ?next= param when navigating between auth routes to avoid
  // stale redirects accumulating in the URL.
  if (isAuthRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/movies/:path*",
    "/voices/:path*",
    "/jobs/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/referral/:path*",
    "/help/:path*",
    "/login",
    "/signup",
    "/forgot-password",
  ],
};
