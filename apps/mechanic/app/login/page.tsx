import { AppShell } from "@mechconnect/ui";
import { SignInForm } from "./auth-form";

export default function LoginPage() {
  return (
    <AppShell role="Mechanic Partner App" title="Mechanic sign in" subtitle="Only admin-verified mechanics can accept jobs and record collections.">
      <SignInForm />
    </AppShell>
  );
}
