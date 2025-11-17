import NextAuth from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const handler = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID || "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET || "",
      issuer: process.env.COGNITO_ISSUER || "",
      authorization: {
        params: {
          prompt: "login", // Forces re-authentication every time
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store Cognito user ID (sub) in the token
      if (account && profile) {
        token.sub = profile.sub;
        token.userId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose user ID in the session
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.userId = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };