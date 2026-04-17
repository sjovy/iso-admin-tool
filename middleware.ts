import { NextResponse, type NextRequest } from "next/server";

// Decode JWT payload without verifying signature — sufficient for routing decisions.
// Full cryptographic verification happens in Server Components via supabase.auth.getUser().
function decodeJWTPayload(token: string): { exp?: number } | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isAuthenticated(request: NextRequest): boolean {
  // @supabase/ssr stores the session in sb-[projectRef]-auth-token (may be chunked as .0, .1, ...)
  const authCookie = request.cookies
    .getAll()
    .find((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (!authCookie) return false;

  const payload = decodeJWTPayload(authCookie.value);
  if (!payload?.exp) return false;

  return payload.exp > Math.floor(Date.now() / 1000);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = isAuthenticated(request);

  if (!authed && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (authed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
