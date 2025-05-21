import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

// GET - Fetch all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST - Insert users from Excel
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

    const createdUsers = await prisma.user.createMany({
      data,
      skipDuplicates: true, // avoids inserting duplicates based on unique fields
    });

    console.log(`Inserted ${createdUsers.count} users`);

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
