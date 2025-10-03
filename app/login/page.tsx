// app/login/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function LoginFormInner() {
  const sp = useSearchParams();
  const error = sp.get('error');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/me', // หรือจะเปลี่ยนเป็น '/edit' ก็ได้
    });
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && (
        <div className="rounded bg-red-500/15 border border-red-500/30 p-2 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border border-white/20 bg-black/20 p-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border border-white/20 bg-black/20 p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-500 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

export default function LoginPage() {
  // ต้องมี Suspense ครอบเมื่อใช้ useSearchParams ใน Client ที่รันบน App Router
  return (
    <Suspense fallback={<main className="p-6">Loading…</main>}>
      <LoginFormInner />
    </Suspense>
  );
}