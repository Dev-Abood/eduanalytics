import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

/**
 * Upload a file to S3
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string = "text/csv"
): Promise<{ success: boolean; key: string; error?: string }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return {
      success: true,
      key,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return {
      success: false,
      key,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Get a signed URL for downloading a file (valid for 1 hour)
 */
export async function getDownloadUrl(key: string): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return signedUrl;
  } catch (error) {
    console.error("S3 Get URL Error:", error);
    return null;
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return false;
  }
}

/**
 * Generate S3 key for a session file
 */
export function generateS3Key(
  userId: string,
  sessionId: string,
  fileType: "marks" | "attendance"
): string {
  return `users/${userId}/sessions/${sessionId}/${fileType}.csv`;
}