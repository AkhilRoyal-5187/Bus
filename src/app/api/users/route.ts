// src/app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" }, // optional: order by id or other field
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("Received data in POST:", data);

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data format: Expected an array of users" },
        { status: 400 }
      );
    }

    // Filter out users that already exist by aadhar or mobileNo
    // Note: The logic for handling existing users by email or rollNumber
    // might also be needed if those are unique and should prevent re-insertion.
    // For now, this focuses on aadhar and mobileNo as per previous code.
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { aadhar: { in: data.map((u: any) => u.aadhar).filter(Boolean) } }, // filter(Boolean) removes undefined/null
          { mobileNo: { in: data.map((u: any) => u.mobileNo).filter(Boolean) } },
          { email: { in: data.map((u: any) => u.email).filter(Boolean) } }, // Added email for comprehensive uniqueness check
          { rollNumber: { in: data.map((u: any) => u.rollNumber).filter(Boolean) } }, // Added rollNumber
        ],
      },
      select: {
        aadhar: true,
        mobileNo: true,
        email: true,      // Select email to check for existing records
        rollNumber: true, // Select rollNumber to check for existing records
      },
    });

    const existingAadhars = new Set(existingUsers.map((u) => u.aadhar).filter(Boolean));
    const existingMobiles = new Set(existingUsers.map((u) => u.mobileNo).filter(Boolean));
    const existingEmails = new Set(existingUsers.map((u) => u.email).filter(Boolean)); // New set
    const existingRollNumbers = new Set(existingUsers.map((u) => u.rollNumber).filter(Boolean)); // New set

    const newUsers = data.filter(
      (u: any) =>
        (!u.aadhar || !existingAadhars.has(u.aadhar)) &&
        (!u.mobileNo || !existingMobiles.has(u.mobileNo)) &&
        (!u.email || !existingEmails.has(u.email)) && // Check email uniqueness
        (!u.rollNumber || !existingRollNumbers.has(u.rollNumber)) // Check rollNumber uniqueness
    );


    if (newUsers.length === 0) {
      return NextResponse.json({
        message: "All users already exist or have duplicate unique fields. Nothing to insert.",
        count: 0,
      });
    }

    // Add a default role if not provided in Excel, and ensure 'password' is not undefined if optional in schema
    const usersToCreate = await Promise.all(newUsers.map(async (user: any) => {
      // Use roll number as password if not provided
      const password = user.password || user.rollNumber;
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      return {
        ...user,
        role: user.role || "student",
        password: hashedPassword,
        email: user.email || `${user.rollNumber}@student.com`, // Ensure email is set
      };
    }));


    const createdUsers = await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true // This is crucial for handling unique constraints gracefully
    });

    return NextResponse.json({
      message: "Users saved successfully",
      count: createdUsers.count,
    });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      {
        error: "Failed to save users",
        details: error.message,
      },
      { status: 500 }
    );
  }
}