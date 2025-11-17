import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "@/lib/auth";

// In-memory session storage (in production, use Redis or database)
const activeSessions = new Map<string, {
  userId: string;
  email: string;
  name: string | null;
  lastSeen: Date;
  userAgent: string;
}>();

export async function GET() {
  const session = await getServerSession();
  
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Clean up stale sessions (older than 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (const [key, value] of activeSessions.entries()) {
    if (value.lastSeen < oneHourAgo) {
      activeSessions.delete(key);
    }
  }

  const sessions = Array.from(activeSessions.values()).map(s => ({
    ...s,
    lastSeen: s.lastSeen.toISOString(),
  }));

  return NextResponse.json({ sessions, total: sessions.length });
}

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userAgent } = await request.json();
  
  // Track this session
  activeSessions.set(session.user.id, {
    userId: session.user.id,
    email: session.user.email || "",
    name: session.user.name || null,
    lastSeen: new Date(),
    userAgent: userAgent || "Unknown",
  });

  return NextResponse.json({ success: true });
}
