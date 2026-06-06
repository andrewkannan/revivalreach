import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Missing email");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        // Impersonation Flow
        if (credentials.password && credentials.password.startsWith("IMPERSONATE:")) {
          const token = credentials.password.split(":")[1];
          if (!user.impersonationToken || user.impersonationToken !== token) {
            throw new Error("Invalid impersonation token");
          }
          if (user.impersonationTokenExpiry && user.impersonationTokenExpiry < new Date()) {
            throw new Error("Impersonation token expired");
          }
          // Clear token after successful impersonation login
          await prisma.user.update({
            where: { id: user.id },
            data: { impersonationToken: null, impersonationTokenExpiry: null }
          });
        } else {
          // Standard Login Flow
          if (!credentials.password) {
            throw new Error("Missing password");
          }
          if (!user.passwordHash) {
            throw new Error("Invalid credentials");
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            throw new Error("Invalid credentials");
          }
        }

        if (!user.isActive) {
          throw new Error("Your account has been disabled by an administrator.");
        }

        if (!user.isApproved) {
          throw new Error("Your account is pending admin approval.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as string;
        token.createdAt = (user as any).createdAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).createdAt = token.createdAt;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_key_for_revival_reach_12345",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
