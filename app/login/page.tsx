"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("callbackUrl") || null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res || res.error) {
      setErr(res?.error || "Invalid email or password");
      setLoading(false);
      return;
    }

    try {
      if (next) {
        router.replace(next);
        return;
      }
      const me = await fetch("/api/me").then(r => r.json());
      if (me?.handle) router.replace(`/${me.handle}/edit`);
      else router.replace("/me");
    } catch {
      router.replace("/me");
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded bg-white/10 px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />
        <input
          className="w-full rounded bg-white/10 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        {err && <div className="text-red-400 text-sm">{err}</div>}
        <button
          disabled={loading}
          className="w-full rounded bg-cyan-600 py-2 font-medium hover:bg-cyan-500 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}