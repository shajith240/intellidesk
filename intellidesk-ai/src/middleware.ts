import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
	const { pathname } = req.nextUrl;

	const isAuthPage =
		pathname.startsWith("/login") || pathname.startsWith("/signup");
	const isAuthApi = pathname.startsWith("/api/auth");
	const isPublicApi =
		pathname.startsWith("/api/emails/ingest") ||
		pathname.startsWith("/api/emails/poll") ||
		pathname.startsWith("/api/emails/process-queue");

	// Allow auth-related routes and public webhook endpoints
	if (isAuthApi || isPublicApi) {
		return NextResponse.next();
	}

	const isLoggedIn = !!req.auth?.user;

	// Redirect logged-in users away from auth pages
	if (isAuthPage && isLoggedIn) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// Redirect unauthenticated users to login
	if (!isAuthPage && !isLoggedIn) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		// Match all routes except static files and Next.js internals
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
