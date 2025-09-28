import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: { email:{label:"Email", type:"text"}, password:{label:"Password", type:"password"} },
      async authorize(credentials){
        if(!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if(!user?.passwordHash) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if(!ok) return null;
        return { id: user.id, email: user.email!, name: user.displayName || user.handle, handle: user.handle,
                 roles: { admin:user.roleAdmin, staff:user.roleStaff, legend:user.roleLegend, hero:user.roleHero } } as any;
      }
    })
  ],
  pages: { signIn: "/create" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }){ if(user){ token.uid=(user as any).id; token.handle=(user as any).handle; token.roles=(user as any).roles; } return token; },
    async session({ session, token }){ (session as any).uid=token.uid; (session as any).handle=token.handle; (session as any).roles=token.roles; return session; }
  },
  secret: process.env.NEXTAUTH_SECRET
};
