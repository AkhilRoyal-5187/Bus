import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
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

    console.log("Password verified, generating token");
    const token = jwt.sign(
      { 
        userId: admin.id,
        email: admin.email,
        role: "admin"
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful");
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin"
      },
      token
    });

    // Set CORS headers
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