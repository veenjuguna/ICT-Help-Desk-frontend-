import { NextRequest, NextResponse } from "next/server";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  ict_personnel: "/ict-dashboard",
  staff: "/dashboard",
};

const PROTECTED_ROUTES: Record<string, string> = {
  "/admin": "admin",
  "/ict-dashboard": "ict_personnel",
  "/dashboard": "staff",
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) return NextResponse.next();

  const requiredRole = PROTECTED_ROUTES[matchedPrefix];
  const role = req.cookies.get("user_role")?.value;

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (role !== requiredRole) {
    const correctPath = ROLE_REDIRECTS[role] ?? "/login";
    return NextResponse.redirect(new URL(correctPath, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/ict-dashboard/:path*", "/dashboard/:path*"],
};
