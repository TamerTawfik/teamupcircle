import NextAuth from "next-auth";
import GitHub from "@auth/core/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.username = user.username;
      session.user.id = user.id;
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.username) {
        await prisma.user.update({
          where: { id: Number(user.id) },
          data: { username: null }
        });
      }
    }
  }
});