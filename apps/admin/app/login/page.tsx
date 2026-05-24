import { AppShell } from "@mechconnect/ui";
import { SignInForm } from "./auth-form";

export default function LoginPage() {
  return (
    <AppShell role="Super Admin Dashboard" title="Admin sign in" subtitle="Admin access is role-gated server-side and protected by Supabase Auth.">
      <SignInForm />
    </AppShell>
  );
}
