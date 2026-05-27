import { AppShell } from "@mechconnect/ui";
import { Suspense } from "react";
import { CustomerAuthForm } from "./auth-form";

export default function LoginPage() {
  return (
    <AppShell role="Customer App" title="Customer account" subtitle="Sign in or create a verified customer account before requesting service.">
      <Suspense fallback={null}>
        <CustomerAuthForm />
      </Suspense>
    </AppShell>
  );
}
