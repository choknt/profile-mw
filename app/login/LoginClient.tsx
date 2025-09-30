// app/login/LoginClient.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginClient({
  initialError = "",
  callbackUrl = "/me",
}: {
  initialError?: string;
  callbackUrl?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });
      if (!res) {
        setErr("No response from server");
      } else if (res.error) {
        setErr(res.error);
      } else {
        // สำเร็จ — ไปต่อหน้า callbackUrl
        window.location.href = res.url || callbackUrl || "/";
      }
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      {err && (
        <div className="mb-3 rounded bg-red-500/15 text-red-300 text-sm p-2">
          {err}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded border border-white/10 bg-white/5 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded border border-white/10 bg-white/5 p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-cyan-600 hover:bg-cyan-500 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
                                      }
