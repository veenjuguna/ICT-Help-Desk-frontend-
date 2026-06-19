import { NextRequest, NextResponse } from "next/server";

// Middleware is intentionally minimal.
// Session verification is handled inside each dashboard page via
// credentials: "include" API calls — the backend validates the
// session_id HttpOnly cookie on every request.
// A middleware cookie check causes redirect loops because the
// cross-origin session_id (secure + samesite=none) may not be
// visible to the Next.js edge runtime on the first navigation.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/ict-dashboard/:path*", "/dashboard/:path*"],
};
