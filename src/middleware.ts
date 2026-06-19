import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/movies", "/voices", "/jobs", "/profile", "/settings", "/referral", "/help"];
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("studio_refresh_token")?.value;
  const isAuthenticated = !!sessionToken;

  const isProtectedRoute = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
