import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.displayName || user.handle,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    // ให้ token เก็บ uid (ไม่จำเป็นมาก แต่เผื่อโค้ดเก่าอ้าง .uid)
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token;
    },
    // ให้ session.user.id ใช้งานได้แน่นอน
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      // เผื่อโค้ดบางที่ยังเรียก session.uid
      if (token?.uid) (session as any).uid = token.uid;
      return session;
    },
  },
};