import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { currentPassword, newPassword, userId } = body;

  if (!currentPassword || !newPassword || !userId) {
    return NextResponse.json(
      { error: "currentPassword, newPassword, and userId are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json(
      { error: "User has no password set" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
