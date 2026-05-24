import { Bike, ShieldCheck } from "lucide-react";
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
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-zinc-950 text-white">
              <Bike size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-bold">MechConnect</p>
              <p className="text-xs text-zinc-500">{role}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 sm:flex">
            <ShieldCheck size={16} aria-hidden="true" />
            RLS secured
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
