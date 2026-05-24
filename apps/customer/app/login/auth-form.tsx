"use client";

import { getBrowserSupabase } from "@mechconnect/supabase";
import { Button, Card } from "@mechconnect/ui";
import { LogIn, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";

export function CustomerAuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const fullName = String(formData.get("fullName") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const supabase = getBrowserSupabase();

    const result = mode === "signup"
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone
            }
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(mode === "signup" ? "Check your email to verify your account." : "Signed in successfully.");
  }

  return (
    <Card className="mx-auto max-w-md">
      <div className="mb-4 flex gap-2">
        <Button type="button" variant={mode === "signin" ? "primary" : "secondary"} onClick={() => setMode("signin")} icon={<LogIn size={16} />}>Sign in</Button>
        <Button type="button" variant={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")} icon={<UserPlus size={16} />}>Sign up</Button>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        {mode === "signup" ? (
          <>
            <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="fullName" placeholder="Full name" required />
            <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="phone" placeholder="10 digit mobile" required pattern="[6-9][0-9]{9}" />
          </>
        ) : null}
        <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="email" placeholder="Email" required type="email" />
        <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="password" placeholder="Password" required type="password" minLength={8} />
        <Button className="w-full" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</Button>
      </form>
      {message ? <p className="mt-3 text-sm text-zinc-600">{message}</p> : null}
    </Card>
  );
}
