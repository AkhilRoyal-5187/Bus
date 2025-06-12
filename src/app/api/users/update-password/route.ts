import { NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, rollNumber } = await request.json();

    if (!email || !rollNumber) {
      return NextResponse.json(
        { error: "Email and roll number are required" },
        { status: 400 }
      );
    }

    // Hash the roll number to use as password
    const hashedPassword = await bcrypt.hash(rollNumber, 10);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password updated successfully",
      user: {
        email: updatedUser.email,
        rollNumber: updatedUser.rollNumber
      }
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
} 