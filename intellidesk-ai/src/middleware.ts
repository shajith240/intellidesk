import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isAuthApi = pathname.startsWith("/api/auth");
  const isPublicApi =
    pathname.startsWith("/api/emails/ingest") ||
    pathname.startsWith("/api/emails/poll") ||
    pathname.startsWith("/api/emails/process-queue");
  const isLandingPage = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  // Allow auth-related routes, public API endpoints, and landing page
  if (isAuthApi || isPublicApi || isLandingPage) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth?.user;

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect dashboard routes
  if (isDashboard && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
