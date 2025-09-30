"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/me";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });
    if (!res) { setErr("Unexpected error"); return; }
    if (res.error) { setErr(res.error || "Invalid credentials"); return; }
    router.push(res.url || "/me");
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full rounded bg-white/5 p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          className="w-full rounded bg-white/5 p-2"
          required
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button className="w-full rounded bg-cyan-600 px-3 py-2 font-medium hover:bg-cyan-500">
          Sign in
        </button>
      </form>
    </main>
  );
}
