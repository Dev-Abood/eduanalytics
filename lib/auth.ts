import { getServerSession } from "next-auth";
import { Session } from "next-auth";

// Admin authorization helper
export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(session.user.email.toLowerCase());
}

// Get session helper for server components
export async function getSession() {
  return await getServerSession();
}
