import { Bike, ClipboardList, Home, MapPin, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
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
    <main className="min-h-screen bg-[#090b10] pb-20 text-white sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b10]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-red-600 text-white shadow-sm shadow-black/40">
              <Bike size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-black tracking-normal">MechConnect</p>
              <p className="text-xs font-semibold text-zinc-400">{role}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-red-100 ring-1 ring-white/10">
              <MapPin size={16} aria-hidden="true" />
              Bengaluru pilot
            </div>
            <div className="inline-flex items-center gap-2 rounded-md bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-200 ring-1 ring-emerald-400/20">
              <ShieldCheck size={16} aria-hidden="true" />
              RLS secured
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
        <div className="mb-5 overflow-hidden rounded-lg border border-white/10 bg-[#151922] text-white shadow-xl shadow-black/30">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-red-500/15 px-3 py-2 text-xs font-bold text-red-100 ring-1 ring-red-400/20">
                <Sparkles size={15} aria-hidden="true" />
                Dark dispatch interface, live-service ready
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-normal sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">{subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Roadside rescue", "Home service", "Verified payout"].map((item) => (
                  <span className="rounded-md bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10" key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="self-end rounded-lg bg-[#090b10] p-3 text-white ring-1 ring-white/10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-zinc-400">Live ops</span>
                <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-black text-emerald-300">Online</span>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
                {[
                  ["WhatsApp GPS", "No maps API"],
                  ["Cash/QR", "Low cost"],
                  ["OTP done", "Secure close"]
                ].map(([item, detail]) => (
                  <div className="rounded-md bg-white/10 px-3 py-2" key={item}>
                    <p className="text-xs font-black text-red-100">{item}</p>
                    <p className="text-[11px] font-semibold text-zinc-400">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {children}
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#090b10]/95 px-4 py-2 shadow-2xl shadow-black/80 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 text-[11px] font-black text-zinc-500">
          {[
            { label: "Home", icon: Home, active: true },
            { label: "Jobs", icon: ClipboardList },
            { label: "Wallet", icon: WalletCards },
            { label: "Profile", icon: UserRound }
          ].map((item) => (
            <button className={item.active ? "flex flex-col items-center gap-1 text-red-600" : "flex flex-col items-center gap-1"} key={item.label}>
              <item.icon size={19} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
