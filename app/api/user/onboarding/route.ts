import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in first" },
        { status: 401 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists. You have already completed onboarding." },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, age, institution, position } = body;

    // Validate required fields
    if (!firstName || !lastName || !age || !institution || !position) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Create new user with onboarding data
    const user = await prisma.user.create({
      data: {
        id: session.user.id,
        email: session.user.email || "",
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        age: parseInt(age),
        institution,
        position,
        onboarded: true,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}