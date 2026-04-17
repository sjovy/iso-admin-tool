import { NextResponse } from "next/server";

// Minimal passthrough — testing Edge runtime compatibility
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)",],
};
