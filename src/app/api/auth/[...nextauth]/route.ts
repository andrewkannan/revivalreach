import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://reach.thisiscccbilingual.com";
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
