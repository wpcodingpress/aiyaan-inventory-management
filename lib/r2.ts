import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export function getR2Client(config: R2Config): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export async function uploadToR2(
  config: R2Config,
  key: string,
  body: Buffer,
  contentType: string
): Promise<{ url: string; key: string }> {
  const client = getR2Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const publicUrl = config.publicUrl
    ? `${config.publicUrl.replace(/\/+$/, "")}/${key}`
    : `https://${config.bucketName}.${config.accountId}.r2.dev/${key}`;

  return { url: publicUrl, key };
}

export async function testR2Connection(config: R2Config): Promise<{ success: boolean; message: string }> {
  try {
    const client = getR2Client(config);
    const command = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 1,
    });
    await client.send(command);
    return { success: true, message: "Connection successful! Bucket is accessible." };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("NoSuchBucket")) {
      return { success: false, message: "Bucket not found. Please check the bucket name." };
    }
    if (errorMessage.includes("InvalidAccessKeyId") || errorMessage.includes("SignatureDoesNotMatch")) {
      return { success: false, message: "Invalid credentials. Please check Access Key ID and Secret Access Key." };
    }
    return { success: false, message: `Connection failed: ${errorMessage}` };
  }
}
