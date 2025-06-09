import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, name, email, password, mobileNo, ...otherFields } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingUser || existingAdmin) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user based on role
    if (role === "student") {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          mobileNo,
          ...otherFields,
        },
      });
      return NextResponse.json(
        { message: "Student created successfully", user },
        { status: 201 }
      );
    } else if (role === "admin") {
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          mobileNo,
        },
      });
      return NextResponse.json(
        { message: "Admin created successfully", admin },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 