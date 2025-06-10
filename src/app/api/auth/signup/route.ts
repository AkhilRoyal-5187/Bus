import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, mobileNo, age, gender, aadhar, course, college, depo } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "admin") {
      // Check if admin already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: "Admin with this email already exists" },
          { status: 400 }
        );
      }

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          mobileNo,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: admin.id,
          email: admin.email,
          role: "admin"
        },
        JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      return NextResponse.json({
        message: "Admin created successfully",
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "admin"
        },
        token
      });
    } else if (role === "student") {
      // Check if student already exists
      const existingStudent = await prisma.user.findUnique({
        where: { email },
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student with this email already exists" },
          { status: 400 }
        );
      }

      // Create student
      const student = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          mobileNo,
          age: age ? parseInt(age) : null,
          gender,
          aadhar,
          course,
          college,
          depo,
          role: "student"
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: student.id,
          email: student.email,
          role: "student"
        },
        JWT_SECRET as string,
        { expiresIn: "24h" }
      );

      return NextResponse.json({
        message: "Student created successfully",
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: "student"
        },
        token
      });
    } else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 