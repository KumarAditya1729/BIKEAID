import { AppShell } from "@mechconnect/ui";
import { SignInForm } from "./auth-form";

export default function LoginPage() {
  return (
    <AppShell role="Garage Owner App" title="Garage owner sign in" subtitle="Garage access is granted by the platform admin after verification.">
      <SignInForm />
    </AppShell>
  );
}
