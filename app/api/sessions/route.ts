import { NextResponse } from "next/server";
import { requireOnboarding } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateS3Key, uploadToS3 } from "@/lib/s3-client";

export async function GET() {
  try {
    const { user } = await requireOnboarding();

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireOnboarding();
    const formData = await request.formData();

    // Get form fields
    const sessionName = formData.get("sessionName") as string;
    const className = formData.get("className") as string;
    const marksFile = formData.get("marksFile") as File;
    const attendanceFile = formData.get("attendanceFile") as File;

    // Validate required fields
    if (!sessionName || !className || !marksFile || !attendanceFile) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate file types
    if (!marksFile.name.endsWith(".csv") || !attendanceFile.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are allowed" },
        { status: 400 }
      );
    }

    // Create session in database first
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        name: sessionName,
        className: className,
        studentsCount: 0, // Will be updated after processing
        marksCount: 0,
        attendanceCount: 0,
        subjects: [],
      },
    });

    // Convert files to buffers
    const marksBuffer = Buffer.from(await marksFile.arrayBuffer());
    const attendanceBuffer = Buffer.from(await attendanceFile.arrayBuffer());

    // Generate S3 keys
    const marksKey = generateS3Key(user.id, session.id, "marks");
    const attendanceKey = generateS3Key(user.id, session.id, "attendance");

    // Upload to S3
    const [marksUpload, attendanceUpload] = await Promise.all([
      uploadToS3(marksBuffer, marksKey, "text/csv"),
      uploadToS3(attendanceBuffer, attendanceKey, "text/csv"),
    ]);

    // Check if uploads were successful
    if (!marksUpload.success || !attendanceUpload.success) {
      // Delete the session if uploads failed
      await prisma.session.delete({ where: { id: session.id } });
      return NextResponse.json(
        { error: "Failed to upload files to storage" },
        { status: 500 }
      );
    }

    // Update session with S3 keys
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: {
        marksFileKey: marksKey,
        attendanceFileKey: attendanceKey,
      },
    });

    return NextResponse.json({ 
      success: true, 
      session: updatedSession 
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}