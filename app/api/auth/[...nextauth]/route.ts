import NextAuth from "next-auth";
import { authOptions } from "./options";

// handler ของ NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };