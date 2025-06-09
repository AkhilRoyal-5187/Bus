import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const users = await req.json();

    // Process each user
    const processedUsers = await Promise.all(
      users.map(async (user: any) => {
        // Generate email if not provided
        const email = user.email || `${user.rollNumber}@student.com`;
        
        // Use roll number as password
        const password = user.rollNumber;
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        return {
          name: user.name,
          email,
          password: hashedPassword,
          rollNumber: user.rollNumber,
          age: user.age ? parseInt(user.age) : null,
          gender: user.gender,
          aadhar: user.aadhar,
          course: user.course,
          mobileNo: user.mobileNo,
          college: user.college,
          depo: user.depo,
          role: "student",
        };
      })
    );

    // Create users in database
    const createdUsers = await Promise.all(
      processedUsers.map(async (user) => {
        try {
          return await prisma.user.create({
            data: user,
          });
        } catch (error) {
          console.error(`Failed to create user ${user.email}:`, error);
          return null;
        }
      })
    );

    // Filter out failed creations
    const successfulCreations = createdUsers.filter((user) => user !== null);

    return NextResponse.json({
      message: `Successfully created ${successfulCreations.length} users`,
      users: successfulCreations,
    });
  } catch (error) {
    console.error("Bulk user creation error:", error);
    return NextResponse.json(
      { error: "Failed to create users" },
      { status: 500 }
    );
  }
} 