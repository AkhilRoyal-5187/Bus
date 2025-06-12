// middleware.ts (at your project root or src/middleware.ts)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set. Please define it.");
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  console.log("--- Middleware Execution Start ---");
  console.log("Request URL:", request.url);
  console.log("Request Pathname:", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Define public paths that *do not* require authentication for the admin flow.
  // IMPORTANT: Use exact matches for root or specific pages, and startsWith for API groups.
  const publicPaths = [
    "/admin",         // Your admin login page
    "/api/admin",     // Your admin login API endpoint
    "/api/admin/logout",    // Your admin logout API endpoint
    "/",                    // Only the exact root path (e.g., your homepage)
    "/signup",              // If you have a general signup page
    "/api/auth/signup",     // If you have a general signup API
    "/api/auth/login",      // If you have a general non-admin login API
  ];

  // Refined check for public paths:
  // Check for exact match OR if it starts with one of the API public paths
  const isPublicPath =
    publicPaths.includes(pathname) || // Check for exact path match
    publicPaths.some(
      (path) =>
        path.startsWith("/api/") && // Only apply startsWith to API paths (or specific folders)
        pathname.startsWith(path)
    );

  // You might also need to exclude other static or Next.js internal paths from being protected by this logic.
  // The `matcher` config handles this for the most part, but for fine-grained logic,
  // ensure paths like `/_next/static`, `/_next/image`, `favicon.ico`, `/public` are effectively ignored
  // or explicitly allowed at the very beginning of the middleware.
  // However, your `config.matcher` should already be doing most of this work:
  // "/((?!_next/static|_next/image|favicon.ico|public).*)",
  // which means these specific exclusions won't even hit this middleware logic.

  if (isPublicPath) {
    console.log(`Middleware: Path '${pathname}' is public. Allowing access.`);
    return NextResponse.next();
  }

  // --- Protected Route Logic ---

  if (!token) {
    console.log(`Middleware: No token found for protected path: '${pathname}'. Redirecting to /admin/login.`);
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  try {
    console.log(`Middleware: Token found. Attempting to verify token for path: '${pathname}'.`);
    const { payload } = await jwtVerify(token, secretKey);
    const role = payload.role as string;

    // --- Role-Based Access Control ---
    if (pathname.startsWith("/admin") || pathname.startsWith("/admindash")) {
      if (role !== "admin") {
        console.log(`Middleware: Unauthorized access attempt to admin area by role: '${role}'. Redirecting.`);
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    if (pathname.startsWith("/student") || pathname.startsWith("/studentdash")) {
      if (role !== "student") {
        console.log(`Middleware: Unauthorized access attempt to student area by role: '${role}'. Redirecting.`);
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    console.log(`Middleware: Token valid and role authorized for path: '${pathname}'. Allowing access.`);
    return NextResponse.next();
  } catch (error) {
    console.error(`Middleware: Token verification failed for path '${pathname}':`, error);
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    // This matcher is good and broad, it will catch `/admindash` and `/api/users`.
    // The internal `publicPaths` logic needs to be precise about exceptions.
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};