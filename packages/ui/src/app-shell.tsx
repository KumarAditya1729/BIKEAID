import { Bike, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  title,
  subtitle,
  role,
  children
}: {
  title: string;
  subtitle: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fff7ed] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-orange-600 text-white shadow-sm shadow-orange-200">
              <Bike size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-black tracking-normal">MechConnect</p>
              <p className="text-xs font-semibold text-zinc-500">{role}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 ring-1 ring-orange-100">
              <MapPin size={16} aria-hidden="true" />
              Bengaluru pilot
            </div>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheck size={16} aria-hidden="true" />
              RLS secured
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
        <div className="mb-5 overflow-hidden rounded-lg bg-zinc-950 text-white shadow-xl shadow-orange-200/60">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.6fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-bold text-orange-100 ring-1 ring-white/10">
                <Sparkles size={15} aria-hidden="true" />
                Fast bike help, field-ready operations
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-normal sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">{subtitle}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 self-end rounded-lg bg-white/10 p-2 ring-1 ring-white/10 lg:grid-cols-1">
              {["WhatsApp GPS", "Cash/QR", "OTP done"].map((item) => (
                <div className="rounded-md bg-white px-3 py-2 text-center text-xs font-black text-zinc-950" key={item}>{item}</div>
              ))}
            </div>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
