import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      }
    });

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: "AWS_S3_BUCKET_NAME is not configured" }, { status: 500 });
    }

    const uniqueFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `testimonies/${uniqueFilename}`,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 minutes

    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/testimonies/${uniqueFilename}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    console.error("Presigned URL error:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
