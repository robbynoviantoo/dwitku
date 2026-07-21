import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse({ error: "Email dan password wajib diisi" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return jsonResponse({ error: "Kredensial tidak valid" }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return jsonResponse({ error: "Kredensial tidak valid" }, 401);
    }

    // Buat session token baru untuk mobile app auth
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    return jsonResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error("Mobile Login Error:", error);
    return jsonResponse({ error: "Terjadi kesalahan server" }, 500);
  }
}
