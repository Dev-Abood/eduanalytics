import { NextResponse } from "next/server";
import { requireOnboarding } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/s3-client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await requireOnboarding();
    const sessionId = params.id;
    const { searchParams } = new URL(request.url);
    const fileType = searchParams.get("type"); // 'marks' or 'attendance'

    if (!fileType || (fileType !== "marks" && fileType !== "attendance")) {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'marks' or 'attendance'" },
        { status: 400 }
      );
    }

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

    // Get the appropriate file key
    const fileKey = fileType === "marks" 
      ? session.marksFileKey 
      : session.attendanceFileKey;

    if (!fileKey) {
      return NextResponse.json(
        { error: "File not found in storage" },
        { status: 404 }
      );
    }

    // Generate signed download URL
    const downloadUrl = await getDownloadUrl(fileKey);

    if (!downloadUrl) {
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      downloadUrl,
      fileName: `${session.name}_${fileType}.csv`,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error("Download URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}