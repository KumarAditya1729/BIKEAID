import { Bike, ClipboardList, Gauge, Home, MapPin, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
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
  const isAdmin = role.toLowerCase().includes("admin");

  return (
    <main className="min-h-screen bg-[#ece9e5] pb-20 text-white sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#ece9e5]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[12px] bg-[#15120f] text-[#ff5a1f] shadow-lg shadow-black/15">
              <Bike size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-black tracking-normal text-[#171310]">MechConnect</p>
              <p className="text-xs font-bold text-zinc-500">{role} · Noida pilot</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-[#171310] shadow-sm ring-1 ring-black/5">
              <MapPin size={16} aria-hidden="true" />
              Noida pilot
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-black text-white shadow-sm">
              <ShieldCheck size={16} aria-hidden="true" />
              RLS secured
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
        <div className={isAdmin ? "grid gap-4 lg:grid-cols-[220px_1fr]" : ""}>
          {isAdmin ? (
            <aside className="hidden rounded-[18px] bg-[#15120f] p-3 shadow-2xl shadow-black/15 lg:block">
              <div className="mb-5 flex items-center gap-2 px-2 pt-2">
                <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#ff5a1f] text-xs font-black">MC</div>
                <div>
                  <p className="text-sm font-black">Ops Board</p>
                  <p className="text-[11px] font-bold text-zinc-500">India hubs</p>
                </div>
              </div>
              {[
                ["Live Operations", ClipboardList, "#live-requests"],
                ["Analytics", Gauge, "#operations-queues"],
                ["Payments", WalletCards, "#wallet"],
                ["Audit Logs", ShieldCheck, "#audit-evidence"]
              ].map(([label, Icon, href]) => (
                <a className="mb-1 flex items-center gap-2 rounded-[10px] px-3 py-3 text-xs font-black text-zinc-400 hover:bg-white/10 hover:text-white" href={href as string} key={label as string}>
                  <Icon size={15} aria-hidden="true" />
                  {label as string}
                </a>
              ))}
            </aside>
          ) : null}
          <div className="min-w-0">
        <div className="mb-5 overflow-hidden rounded-[20px] border border-white/10 bg-[#15120f] text-white shadow-2xl shadow-black/20">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff5a1f]/15 px-3 py-2 text-xs font-black text-orange-100 ring-1 ring-[#ff5a1f]/25">
                <Sparkles size={15} aria-hidden="true" />
                Live-service ready
              </div>
              <h1 className="max-w-4xl text-2xl font-black tracking-normal sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">{subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Roadside rescue", "Home service", "Verified payout"].map((item) => (
                  <span className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10" key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="self-end rounded-[16px] bg-[#0f0d0b] p-3 text-white ring-1 ring-white/10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-zinc-400">Live ops</span>
                <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-black text-emerald-300">Online</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["WhatsApp GPS", "No maps API"],
                  ["Cash/QR", "Low cost"],
                  ["OTP done", "Secure close"]
                ].map(([item, detail]) => (
                  <div className="rounded-[12px] bg-white/10 px-3 py-2" key={item}>
                    <p className="text-xs font-black text-orange-100">{item}</p>
                    <p className="text-[11px] font-semibold text-zinc-400">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {children}
          </div>
        </div>
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#15120f]/95 px-4 py-2 shadow-2xl shadow-black/80 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 text-[11px] font-black text-zinc-500">
          {[
            { label: "Home", icon: Home, href: "/", active: true },
            { label: "Jobs", icon: ClipboardList, href: "#jobs" },
            { label: "Wallet", icon: WalletCards, href: "#wallet" },
            { label: "Profile", icon: UserRound, href: "/login" }
          ].map((item) => (
            <a className={item.active ? "flex flex-col items-center gap-1 text-[#ff5a1f]" : "flex flex-col items-center gap-1"} href={item.href} key={item.label}>
              <item.icon size={19} aria-hidden="true" />
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
