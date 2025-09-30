// app/login/page.tsx
import LoginClient from "./LoginClient";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; callbackUrl?: string };
}) {
  const error = searchParams?.error ?? "";
  const callbackUrl = searchParams?.callbackUrl ?? "/me";

  return <LoginClient initialError={error} callbackUrl={callbackUrl} />;
}
