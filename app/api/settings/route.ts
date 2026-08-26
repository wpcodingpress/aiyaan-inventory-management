import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const organization = await prisma.organization.findUnique({
    where: { id: "default" },
  });

  if (!organization) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ organization });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const data: Record<string, string | boolean | null> = {};

  if (body.businessName !== undefined) data.name = body.businessName;
  if (body.businessType !== undefined) data.businessType = body.businessType;
  if (body.contactEmail !== undefined) data.contactEmail = body.contactEmail;
  if (body.contactPhone !== undefined) data.contactPhone = body.contactPhone;
  if (body.address !== undefined) data.address = body.address;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.timezone !== undefined) data.timezone = body.timezone;
  if (body.dateFormat !== undefined) data.dateFormat = body.dateFormat;
  if (body.logo !== undefined) data.logo = body.logo;
  if (body.favicon !== undefined) data.favicon = body.favicon;
  if (body.primaryColor !== undefined) data.primaryColor = body.primaryColor;
  if (body.secondaryColor !== undefined) data.secondaryColor = body.secondaryColor;
  if (body.r2Provider !== undefined) data.r2Provider = body.r2Provider;
  if (body.r2AccountId !== undefined) data.r2AccountId = body.r2AccountId;
  if (body.r2AccessKeyId !== undefined) data.r2AccessKeyId = body.r2AccessKeyId;
  if (body.r2SecretAccessKey !== undefined) data.r2SecretAccessKey = body.r2SecretAccessKey;
  if (body.r2BucketName !== undefined) data.r2BucketName = body.r2BucketName;
  if (body.r2PublicUrl !== undefined) data.r2PublicUrl = body.r2PublicUrl;
  if (body.r2Connected !== undefined) data.r2Connected = body.r2Connected;

  const organization = await prisma.organization.upsert({
    where: { id: "default" },
    update: data,
    create: {
      id: "default",
      name: body.businessName || "Organization",
      slug: "default",
      ...data,
    },
  });

  return NextResponse.json({ message: "Settings updated successfully", organization });
}
