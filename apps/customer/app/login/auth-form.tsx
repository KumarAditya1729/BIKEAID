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
    <Card className="mx-auto max-w-md overflow-hidden p-0">
      <div className="bg-red-600 p-5 text-white">
        <p className="text-xs font-black uppercase tracking-wide text-red-100">Customer access</p>
        <h2 className="mt-2 text-2xl font-black">Ready for bike help?</h2>
        <p className="mt-2 text-sm leading-6 text-red-50">Use a verified account before booking service.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pb-0">
        <Button type="button" variant={mode === "signin" ? "primary" : "secondary"} onClick={() => setMode("signin")} icon={<LogIn size={16} />}>Sign in</Button>
        <Button type="button" variant={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")} icon={<UserPlus size={16} />}>Sign up</Button>
      </div>
      <form className="space-y-3 p-4" onSubmit={submit}>
        {mode === "signup" ? (
          <>
            <input className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500" name="fullName" placeholder="Full name" required />
            <input className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500" name="phone" placeholder="10 digit mobile" required pattern="[6-9][0-9]{9}" />
          </>
        ) : null}
        <input className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500" name="email" placeholder="Email" required type="email" />
        <input className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500" name="password" placeholder="Password" required type="password" minLength={8} />
        <Button className="w-full" type="submit">{mode === "signup" ? "Create account" : "Sign in"}</Button>
        {message ? <p className="text-sm font-semibold text-zinc-300">{message}</p> : null}
      </form>
    </Card>
  );
}
