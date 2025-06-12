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
    console.log("Received login request");
    const body = await request.json();
    console.log("Request body:", { ...body, password: "[REDACTED]" });

    if (!body) {
      console.log("No request body provided");
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const { email, password, role } = body;

    if (!email || !password || !role) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Email, password and role are required" },
        { status: 400 }
      );
    }

    console.log("Looking for user with email:", email);
    let user;
    if (role === "admin") {
      user = await prisma.admin.findUnique({
        where: { email },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("User found, verifying password");
    if (!user.password) {
      console.log("User has no password set");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

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
        userId: user.id,
        email: user.email,
        role: role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful");
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 