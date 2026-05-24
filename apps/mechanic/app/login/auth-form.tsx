"use client";

import { getBrowserSupabase } from "@mechconnect/supabase";
import { Button, Card } from "@mechconnect/ui";
import { FormEvent, useState } from "react";

export function SignInForm() {
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in successfully.");
  }

  return (
    <Card className="mx-auto max-w-md">
      <form className="space-y-3" onSubmit={submit}>
        <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="email" placeholder="Email" required type="email" />
        <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" name="password" placeholder="Password" required type="password" />
        <Button className="w-full" type="submit">Sign in</Button>
      </form>
      {message ? <p className="mt-3 text-sm text-zinc-600">{message}</p> : null}
    </Card>
  );
}
