import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testR2Connection } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accountId, accessKeyId, secretAccessKey, bucketName } = body;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return NextResponse.json(
      { error: "All R2 credentials are required (accountId, accessKeyId, secretAccessKey, bucketName)" },
      { status: 400 }
    );
  }

  const result = await testR2Connection({
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
  });

  if (result.success) {
    await prisma.organization.update({
      where: { id: "default" },
      data: {
        r2AccountId: accountId,
        r2AccessKeyId: accessKeyId,
        r2SecretAccessKey: secretAccessKey,
        r2BucketName: bucketName,
        r2Connected: true,
      },
    });
  }

  return NextResponse.json(result);
}
