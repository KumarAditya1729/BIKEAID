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
  const isMobileProduct = !isAdmin;

  if (isMobileProduct) {
    return (
      <main className="min-h-screen bg-[#f3eee8] text-[#17120f] sm:flex sm:items-start sm:justify-center sm:px-5 sm:py-6">
        <div className="mobile-shell relative min-h-screen w-full overflow-hidden bg-[#100d0b] text-white shadow-2xl shadow-black/25 sm:min-h-[860px] sm:max-w-[430px] sm:rounded-[36px] sm:border-[10px] sm:border-[#18120f]">
          <header className="sticky top-0 z-20 bg-[#100d0b]/95 px-4 pb-3 pt-4 backdrop-blur-md">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ff5a1f] text-white shadow-lg shadow-orange-500/25">
                  <Bike size={23} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-black leading-tight text-white">MechConnect</p>
                  <p className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                    <MapPin size={13} aria-hidden="true" className="text-[#ff7a45]" />
                    Noida pilot
                  </p>
                </div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <UserRound size={18} aria-hidden="true" />
              </div>
            </div>
            <div className="rounded-[26px] bg-gradient-to-br from-[#ff5a1f] via-[#f04719] to-[#21120b] p-4 shadow-xl shadow-orange-950/35">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-orange-50">
                <Sparkles size={13} aria-hidden="true" />
                {role.replace(" App", "")}
              </div>
              <h1 className="text-[26px] font-black leading-[1.05] tracking-normal text-white">{title}</h1>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-orange-50/90">{subtitle}</p>
            </div>
          </header>
          <section className="px-4 pb-24 pt-2">
            {children}
          </section>
          <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-white/10 bg-[#100d0b]/95 px-5 py-3 shadow-2xl backdrop-blur-md sm:bottom-6 sm:rounded-b-[26px] sm:border-x-[10px] sm:border-b-[10px] sm:border-[#18120f]">
            <div className="grid grid-cols-4 text-[11px] font-black text-zinc-500">
              {[
                { label: "Home", icon: Home, href: "/", active: true },
                { label: "Jobs", icon: ClipboardList, href: "#jobs" },
                { label: "Wallet", icon: WalletCards, href: "#wallet" },
                { label: "Profile", icon: UserRound, href: "/login" }
              ].map((item) => (
                <a className={item.active ? "flex flex-col items-center gap-1 text-[#ff5a1f] transition" : "flex flex-col items-center gap-1 hover:text-white transition"} href={item.href} key={item.label}>
                  <item.icon size={20} aria-hidden="true" />
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b09] pb-20 text-[#f4f2f0] sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#15120f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[12px] bg-[#1a1613] text-[#ff5a1f] shadow-lg shadow-[#ff5a1f]/10 border border-[#ff5a1f]/20">
              <Bike size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-black tracking-normal text-white">MechConnect</p>
              <p className="text-xs font-bold text-zinc-400">{role} · Noida pilot</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm font-black text-zinc-200 border border-white/10 shadow-sm">
              <MapPin size={16} aria-hidden="true" className="text-[#ff5a1f]" />
              Noida pilot
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/40 px-3 py-2 text-sm font-black text-emerald-300 border border-emerald-500/30 shadow-sm">
              <ShieldCheck size={16} aria-hidden="true" className="text-emerald-400" />
              RLS secured
            </div>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
        <div className={isAdmin ? "grid gap-4 lg:grid-cols-[220px_1fr]" : ""}>
          {isAdmin ? (
            <aside className="hidden rounded-[18px] border border-white/5 bg-[#15120f]/60 backdrop-blur-md p-3 shadow-2xl lg:block">
              <div className="mb-5 flex items-center gap-2 px-2 pt-2">
                <div className="flex size-9 items-center justify-center rounded-[10px] bg-[#ff5a1f] text-xs font-black shadow-md shadow-orange-500/20">MC</div>
                <div>
                  <p className="text-sm font-black text-white">Ops Board</p>
                  <p className="text-[11px] font-bold text-zinc-400">India hubs</p>
                </div>
              </div>
              {[
                ["Live Operations", ClipboardList, "#live-requests"],
                ["Analytics", Gauge, "#operations-queues"],
                ["Payments", WalletCards, "#wallet"],
                ["Audit Logs", ShieldCheck, "#audit-evidence"]
              ].map(([label, Icon, href]) => (
                <a className="mb-1 flex items-center gap-2 rounded-[10px] px-3 py-3 text-xs font-black text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-200" href={href as string} key={label as string}>
                  <Icon size={15} aria-hidden="true" className="text-zinc-500 hover:text-zinc-300" />
                  {label as string}
                </a>
              ))}
            </aside>
          ) : null}
          <div className="min-w-0">
        <div className="mb-5 overflow-hidden rounded-[20px] border border-white/5 bg-gradient-to-br from-[#1c1814] to-[#120f0d] text-white shadow-2xl">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff5a1f]/15 px-3 py-2 text-xs font-black text-orange-100 ring-1 ring-[#ff5a1f]/25 shadow-sm">
                <Sparkles size={15} aria-hidden="true" className="text-[#ff5a1f]" />
                Live-service ready
              </div>
              <h1 className="max-w-4xl text-2xl font-black tracking-normal sm:text-4xl bg-clip-text bg-gradient-to-r from-white to-zinc-400">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">{subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Roadside rescue", "Home service", "Verified payout"].map((item) => (
                  <span className="rounded-full bg-white/5 px-3 py-2 text-xs font-black text-zinc-300 border border-white/5 shadow-sm" key={item}>{item}</span>
                ))}
              </div>
            </div>
            <div className="self-end rounded-[16px] bg-[#090807] p-3 text-white border border-white/5 shadow-inner">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-zinc-400">Live ops</span>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-300 border border-emerald-500/20">Online</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ["WhatsApp GPS", "No maps API"],
                  ["Cash/QR", "Low cost"],
                  ["OTP done", "Secure close"]
                ].map(([item, detail]) => (
                  <div className="rounded-[12px] bg-white/5 border border-white/5 px-3 py-2 hover:bg-white/[0.08] transition" key={item}>
                    <p className="text-xs font-black text-orange-200">{item}</p>
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
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#15120f]/90 px-4 py-2 shadow-2xl backdrop-blur-md sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 text-[11px] font-black text-zinc-400">
          {[
            { label: "Home", icon: Home, href: "/", active: true },
            { label: "Jobs", icon: ClipboardList, href: "#jobs" },
            { label: "Wallet", icon: WalletCards, href: "#wallet" },
            { label: "Profile", icon: UserRound, href: "/login" }
          ].map((item) => (
            <a className={item.active ? "flex flex-col items-center gap-1 text-[#ff5a1f] transition" : "flex flex-col items-center gap-1 hover:text-white transition"} href={item.href} key={item.label}>
              <item.icon size={19} aria-hidden="true" />
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
