import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { NextAuthProvider } from "@/components/NextAuthProvider";

export const metadata: Metadata = {
  title: "PlayMW – Command Registry",
  description: "Modern Warships Community Profiles"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
