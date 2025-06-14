// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Ensure JWT_SECRET is always available at runtime
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

  // Define public paths that *do not* require authentication.
  const publicPaths = [
    "/admin",
    "/student",
    "/api/admin/login",
    "/api/admin/logout",
    "/api/auth/login",
    "/",
    "/signup",
    "/api/auth/signup",
    "/api/chat", // <--- ADD THIS LINE HERE!
  ];

  const isPublicPath =
    publicPaths.includes(pathname) ||
    publicPaths.some(
      (path) =>
        path.startsWith("/api/") &&
        pathname.startsWith(path)
    );

  if (isPublicPath) {
    console.log(`Middleware: Path '${pathname}' is public. Allowing access.`);
    return NextResponse.next();
  }

  // --- Protected Route Logic ---
  if (!token) {
    console.log(`Middleware: No token found for protected path: '${pathname}'. Redirecting to appropriate login page.`);
    const redirectPath = pathname.startsWith("/student") ? "/student" : "/admin";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  try {
    console.log(`Middleware: Token found. Attempting to verify token for path: '${pathname}'.`);
    const { payload } = await jwtVerify(token, secretKey);
    const role = payload.role as string;

    if (pathname.startsWith("/admin") || pathname.startsWith("/admindash")) {
      if (role !== "admin") {
        console.log(`Middleware: Unauthorized access attempt to admin area by role: '${role}'. Redirecting.`);
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    if (pathname.startsWith("/student") || pathname.startsWith("/studentdash")) {
      if (role !== "student") {
        console.log(`Middleware: Unauthorized access attempt to student area by role: '${role}'. Redirecting.`);
        return NextResponse.redirect(new URL("/student", request.url));
      }
    }

    console.log(`Middleware: Token valid and role authorized for path: '${pathname}'. Allowing access.`);
    return NextResponse.next();

  } catch (error) {
    console.error(`Middleware: Token verification failed for path '${pathname}':`, error);
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};