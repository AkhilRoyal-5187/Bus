// app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Ensures this route is dynamic and not cached
export const runtime = 'nodejs'; // Specifies the Node.js runtime for this route

export async function POST(request: NextRequest) {
  try {
    console.log("Received admin logout request");

    // Create a new NextResponse instance
    const response = NextResponse.json({
      message: "Logout successful"
    }, { status: 200 });

    // Clear the 'token' HTTP-only cookie
    // Set maxAge to 0 or a past date to expire the cookie immediately
    // Ensure the path, domain, and sameSite properties match those set during login
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Matches login route setting
      maxAge: 0, // Expires the cookie immediately
      path: '/', // Matches login route setting
      sameSite: 'lax', // Matches login route setting
    });

    // You can optionally add CORS headers if your frontend is on a different origin,
    // but typically not needed if frontend and backend are on the same domain/origin
    // within a Next.js project.
    // Keeping them for consistency if you had them elsewhere:
    response.headers.set('Access-Control-Allow-Origin', '*'); // Adjust as needed for production
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Only allow methods relevant to logout
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log("Admin logout successful, cookie cleared");
    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error during logout" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests (preflight requests)
export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*'); // Adjust as needed
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}