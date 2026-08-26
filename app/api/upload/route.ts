import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

async function ensureDir(dir: string) {
  const { mkdirSync, existsSync } = await import("fs");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function saveFile(filePath: string, data: Buffer) {
  const { writeFileSync } = await import("fs");
  writeFileSync(filePath, data);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: jpg, png, gif, webp, svg" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");

  await ensureDir(uploadDir);

  const bytes = await file.arrayBuffer();
  saveFile(join(uploadDir, filename), Buffer.from(bytes));

  return NextResponse.json({ url: `/uploads/${filename}` });
}
