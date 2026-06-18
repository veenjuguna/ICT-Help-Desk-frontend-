import { NextRequest, NextResponse } from "next/server";

// Middleware does a lightweight cookie-presence check.
// Full session + role verification is handled inside each dashboard page.
// NOTE: On localhost the session_id cookie has secure=true + samesite=none
// so it won't be sent over HTTP — skip the check in development to avoid
// redirect loops.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/ict-dashboard") ||
    pathname.startsWith("/dashboard");

  if (!isProtected) return NextResponse.next();

  // Skip cookie check in development — cookie requires HTTPS (secure=true)
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  // In production: if no session_id cookie, redirect to login
  const hasSession = req.cookies.has("session_id");
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/ict-dashboard/:path*", "/dashboard/:path*"],
};
