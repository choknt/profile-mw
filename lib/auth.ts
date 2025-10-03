import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email!, name: user.displayName || user.handle };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      return session;
    },
    // <— ตัวนี้สำคัญ: ถ้าไม่มี callbackUrl ให้ส่งไป /me เสมอ
    async redirect({ url, baseUrl }) {
      try {
        // อนุญาต path ภายใน
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // อนุญาตเฉพาะโดเมนเดียวกัน
        const u = new URL(url, baseUrl);
        if (u.origin === baseUrl) return u.toString();
      } catch {}
      // fallback
      return `${baseUrl}/me`;
    },
  },
};