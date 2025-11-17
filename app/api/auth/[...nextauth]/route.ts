import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";

// NextAuth handler with the centralized configuration
const handler = NextAuth(authOptions);

// Export for both GET and POST methods
export { handler as GET, handler as POST };