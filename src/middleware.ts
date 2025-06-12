// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Ensure JWT_SECRET is always available at runtime
const JWT_SECRET = process.env.JWT_SECRET;

// IMPORTANT: Do NOT use a hardcoded fallback secret like 'your-secret-key' in production.
// If JWT_SECRET is not defined, throw an error to prevent starting with a weak secret.
if (!JWT_SECRET) {
  // In a serverless environment (like Vercel), this error might occur during build or runtime
  // if the environment variable isn't properly set.
  // For local development, ensure it's in your .env.local file.
  throw new Error("JWT_SECRET environment variable is not set. Please define it.");
}

// Convert the secret to a Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  // --- Debugging Logs (keep these for now, can remove after confirming functionality) ---
  console.log("--- Middleware Execution Start ---");
  console.log("Request URL:", request.url);
  console.log("Request Pathname:", request.nextUrl.pathname);
  // --- End Debugging Logs ---

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Define public paths that *do not* require authentication.
  // These are paths that ANYONE can access without a valid JWT.
  const publicPaths = [
    "/admin",               // The actual admin login page (e.g., your login form)
    "/api/admin/login",     // The API endpoint for admin login (must be public)
    "/api/admin/logout",    // The API endpoint for admin logout (must be public)
    "/",                    // Your public homepage (if it exists)
    "/signup",              // A general user signup page (if it exists)
    "/api/auth/signup",     // A general user signup API (if it exists)
    "/api/auth/login",      // A general user login API (if it exists, separate from admin)
    // Add other public routes here as needed (e.g., /about, /contact, /public/* etc.)
  ];

  // Determine if the current pathname is considered a public path.
  // This logic checks for an exact match for pages OR a `startsWith` for API routes (or specific folders)
  // to ensure flexibility while being precise.
  const isPublicPath =
    publicPaths.includes(pathname) || // Exact path match (for /admin, /, /signup)
    publicPaths.some(
      (path) =>
        path.startsWith("/api/") && // Only apply startsWith to paths that start with '/api/'
        pathname.startsWith(path) // Check if the request pathname starts with a public API path
    );

  // If the path is public, allow the request to proceed immediately.
  if (isPublicPath) {
    console.log(`Middleware: Path '${pathname}' is public. Allowing access.`);
    return NextResponse.next();
  }

  // --- Protected Route Logic ---
  // If we reach here, the path is NOT public, so we need a token.

  // If no token is found in the cookies, redirect to the admin login page.
  if (!token) {
    console.log(`Middleware: No token found for protected path: '${pathname}'. Redirecting to /admin.`);
    // Construct the URL to redirect to the login page
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If a token is found, attempt to verify it.
  try {
    console.log(`Middleware: Token found. Attempting to verify token for path: '${pathname}'.`);
    // Verify the token using the jose library and the secret key
    const { payload } = await jwtVerify(token, secretKey);

    // Assuming your JWT payload includes a 'role' property (e.g., 'admin', 'student')
    const role = payload.role as string; // Assert the type for 'role' for TypeScript safety

    // --- Role-Based Access Control (RBAC) ---
    // If the path starts with '/admin' or '/admindash', ensure the user has 'admin' role.
    if (pathname.startsWith("/admin") || pathname.startsWith("/admindash")) {
      if (role !== "admin") {
        console.log(`Middleware: Unauthorized access attempt to admin area by role: '${role}'. Redirecting.`);
        // If not an admin, redirect them back to the login page (or an unauthorized page)
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Example for 'student' role (uncomment and adjust if you have student routes)
    if (pathname.startsWith("/student") || pathname.startsWith("/studentdash")) {
      if (role !== "student") {
        console.log(`Middleware: Unauthorized access attempt to student area by role: '${role}'. Redirecting.`);
        return NextResponse.redirect(new URL("/admin", request.url)); // Or a student-specific login
      }
    }

    // If the token is valid AND the role is authorized for the requested path, allow access.
    console.log(`Middleware: Token valid and role authorized for path: '${pathname}'. Allowing access.`);
    return NextResponse.next();

  } catch (error) {
    // If token verification fails (e.g., token is expired, tampered with, or invalid signature)
    console.error(`Middleware: Token verification failed for path '${pathname}':`, error);
    // Redirect to the login page and also delete the invalid/expired token from the browser.
    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.delete("token"); // This helps clear stale/invalid tokens
    return response;
  }
}

// The `config.matcher` array specifies which paths the middleware should apply to.
// This is a broad matcher that applies to almost all routes,
// with specific exclusions handled by the `publicPaths` array inside the middleware logic.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (Next.js static assets like JS/CSS bundles)
     * - _next/image (Next.js image optimization files)
     * - favicon.ico (the website icon)
     * - /public folder (static files placed directly in the `public/` directory)
     *
     * This setup means almost every request will hit the middleware,
     * and then the `publicPaths` logic inside decides whether to protect it or not.
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};