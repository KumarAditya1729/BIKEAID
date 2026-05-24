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
    <Card className="mx-auto max-w-md overflow-hidden border-red-200 p-0">
      <div className="bg-red-600 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-wide text-red-100">Partner access</p>
        <h2 className="mt-2 text-2xl font-black">Mechanic access</h2>
        <p className="mt-2 text-sm leading-6 text-red-50">Sign in to manage field jobs and earnings.</p>
      </div>
      <form className="space-y-3 p-4" onSubmit={submit}>
        <input className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500" name="email" placeholder="Email" required type="email" />
        <input className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500" name="password" placeholder="Password" required type="password" />
        <Button className="w-full" type="submit">Sign in</Button>
        {message ? <p className="text-sm font-semibold text-zinc-600">{message}</p> : null}
      </form>
    </Card>
  );
}
