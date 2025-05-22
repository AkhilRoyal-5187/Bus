import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
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

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { aadhar: { in: data.map((u) => u.aadhar).filter(Boolean) } },
          { mobileNo: { in: data.map((u) => u.mobileNo).filter(Boolean) } },
        ],
      },
      select: {
        aadhar: true,
        mobileNo: true,
      },
    });

    const existingAadhars = new Set(existingUsers.map((u) => u.aadhar));
    const existingMobiles = new Set(existingUsers.map((u) => u.mobileNo));

    const newUsers = data.filter(
      (u: any) =>
        (!u.aadhar || !existingAadhars.has(u.aadhar)) &&
        (!u.mobileNo || !existingMobiles.has(u.mobileNo))
    );

    if (newUsers.length === 0) {
      return NextResponse.json({
        message: "All users already exist. Nothing to insert.",
        count: 0,
      });
    }

    const createdUsers = await prisma.user.createMany({
      data: newUsers,
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
