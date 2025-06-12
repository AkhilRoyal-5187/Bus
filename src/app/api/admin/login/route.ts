// app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose"; // Import SignJWT from jose

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET; // Remove 'as string' and let the check handle it

// Ensure JWT_SECRET is always available at runtime
if (!JWT_SECRET) {
  // In a serverless environment (like Vercel), this error might occur during build or runtime
  // if the environment variable isn't properly set.
  // For local development, ensure it's in your .env.local file.
  throw new Error("JWT_SECRET environment variable is not set. Please define it.");
}

// Convert the secret to a Uint8Array for jose
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log("Received admin login request");
    const body = await request.json();
    console.log("Request body:", { ...body, password: "[REDACTED]" });

    if (!body) {
      console.log("No request body provided");
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Looking for admin with email:", email);
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      console.log("Admin not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Admin found, verifying password");
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      console.log("Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("Password verified, generating token with jose");

    // Generate the token using jose.SignJWT
    const token = await new SignJWT(
      {
        userId: admin.id,
        email: admin.email,
        role: "admin", // Ensure the 'role' is included for middleware checks
      })
      .setProtectedHeader({ alg: 'HS256' }) // Use HS256 algorithm
      .setIssuedAt()
      .setExpirationTime("1h") // Token expires in 1 hour (e.g., '1h', '2d', '10m')
      .sign(secretKey); // Sign the token with your secret key

    console.log("Login successful, setting HTTP-only cookie");
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin",
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour in seconds, matches JWT expiration
      path: '/',
      sameSite: 'lax',
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}