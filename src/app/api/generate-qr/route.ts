import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    const token = jwt.sign({ userId, expiresAt }, SECRET_KEY);
    const qrImageUrl = await QRCode.toDataURL(token);

    return NextResponse.json({ token, qrImageUrl, expiresAt });
  } catch (_error) {
    return NextResponse.json({ error: "QR generation failed" }, { status: 500 });
  }
}
