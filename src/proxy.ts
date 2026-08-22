import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionFromToken } from "@/lib/jwt";

const protectedPrefixes = [
  "/dashboard",
  "/universe",
  "/insights",
  "/intelligence",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionFromToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/universe/:path*",
    "/insights/:path*",
    "/intelligence/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
  ],
};
