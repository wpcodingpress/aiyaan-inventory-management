import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

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

    const org = await prisma.organization.findUnique({ where: { id: "default" } });
    if (!org || !org.r2AccountId || !org.r2AccessKeyId || !org.r2SecretAccessKey || !org.r2BucketName) {
      return NextResponse.json(
        { error: "Cloud storage not configured. Please connect R2 in Settings > Cloud Storage." },
        { status: 503 }
      );
    }

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${crypto.randomUUID()}.${ext}`;
    const key = `${folder}/${filename}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2(
      {
        accountId: org.r2AccountId,
        accessKeyId: org.r2AccessKeyId,
        secretAccessKey: org.r2SecretAccessKey,
        bucketName: org.r2BucketName,
        publicUrl: org.r2PublicUrl || undefined,
      },
      key,
      buffer,
      file.type
    );

    return NextResponse.json({ url: result.url, key: result.key });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
