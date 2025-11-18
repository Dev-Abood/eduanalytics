import { NextResponse } from "next/server";
import { requireOnboarding } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import Papa from "papaparse";
import { calculateClassAnalytics, calculateStudentAnalytics } from "@/lib/analytics";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

async function fetchCSVFromS3(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const str = await response.Body?.transformToString();
  return str || "";
}

function parseCSV(csvContent: string): any[] {
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return result.data.filter((row: any) =>
    Object.values(row).some((v) => v && String(v).trim() !== "")
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireOnboarding();
    const sessionId = params.id;

    // Get session from database
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user owns this session
    if (session.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if analytics are already cached
    if (session.analytics) {
      return NextResponse.json({
        cached: true,
        analytics: session.analytics,
      });
    }

    // Fetch CSV files from S3
    if (!session.marksFileKey || !session.attendanceFileKey) {
      return NextResponse.json(
        { error: "CSV files not found for this session" },
        { status: 404 }
      );
    }

    const [marksCSV, attendanceCSV] = await Promise.all([
      fetchCSVFromS3(session.marksFileKey),
      fetchCSVFromS3(session.attendanceFileKey),
    ]);

    // Parse CSV data
    const marksData = parseCSV(marksCSV);
    const attendanceData = parseCSV(attendanceCSV);

    // Calculate analytics
    const classAnalytics = calculateClassAnalytics(marksData, attendanceData);
    const studentAnalytics = calculateStudentAnalytics(marksData, attendanceData);

    // Convert Map to array for JSON serialization
    const studentAnalyticsArray = Array.from(studentAnalytics.values());

    const analytics = {
      classAnalytics,
      studentAnalytics: studentAnalyticsArray,
      studentsCount: studentAnalytics.size,
    };

    // Update session with analytics and student count
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        analytics: analytics as any,
        studentsCount: studentAnalytics.size,
        marksCount: marksData.length,
        attendanceCount: attendanceData.length,
        subjects: classAnalytics.subjectDifficulty 
          ? Object.keys(classAnalytics.subjectDifficulty)
          : [],
      },
    });

    return NextResponse.json({
      cached: false,
      analytics,
    });
  } catch (error) {
    console.error("Analytics generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    );
  }
}