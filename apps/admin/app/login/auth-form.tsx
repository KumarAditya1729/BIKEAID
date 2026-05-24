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
    <Card className="mx-auto max-w-md border-orange-200">
      <div className="mb-4">
        <h2 className="text-xl font-black">Admin access</h2>
        <p className="text-sm text-zinc-500">Review dispatch, payments, disputes, and approvals.</p>
      </div>
      <form className="space-y-3" onSubmit={submit}>
        <input className="min-h-12 w-full rounded-md border border-orange-100 bg-orange-50/40 px-3 font-semibold outline-none focus:border-orange-500" name="email" placeholder="Email" required type="email" />
        <input className="min-h-12 w-full rounded-md border border-orange-100 bg-orange-50/40 px-3 font-semibold outline-none focus:border-orange-500" name="password" placeholder="Password" required type="password" />
        <Button className="w-full" type="submit">Sign in</Button>
      </form>
      {message ? <p className="mt-3 text-sm text-zinc-600">{message}</p> : null}
    </Card>
  );
}
