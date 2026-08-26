import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/products",
  "/inventory",
  "/purchases",
  "/sales",
  "/customers",
  "/suppliers",
  "/finance",
  "/expenses",
  "/reports",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/purchases/:path*",
    "/sales/:path*",
    "/customers/:path*",
    "/suppliers/:path*",
    "/finance/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
