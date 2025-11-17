import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

/**
 * Get the current authenticated user from the database
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user;
}

/**
 * Require authentication - redirects to sign in if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return session;
}

/**
 * Require onboarding - redirects to onboarding if user hasn't completed it
 * Use this on protected pages that require onboarding to be completed
 */
export async function requireOnboarding() {
  const session = await requireAuth();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.onboarded) {
    redirect("/onboarding");
  }

  return { session, user };
}

/**
 * Check if user exists in database
 */
export async function checkUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user !== null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}