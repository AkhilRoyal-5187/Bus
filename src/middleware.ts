import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/signup", "/api/auth/login", "/api/auth/signup"];
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");
    const { payload } = await jwtVerify(token, secret);

    // Check role-based access
    const role = payload.role as string;
    const path = request.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/admin") || path.startsWith("/admindash")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Student routes
    if (path.startsWith("/student") || path.startsWith("/studentdash")) {
      if (role !== "student") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

