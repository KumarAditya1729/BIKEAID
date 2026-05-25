import { clsx } from "clsx";

const tones = {
  neutral: "bg-white/10 text-zinc-200 ring-1 ring-white/10",
  good: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
  warn: "bg-[#ff5a1f]/15 text-orange-200 ring-1 ring-[#ff5a1f]/30",
  bad: "bg-red-400/10 text-red-300 ring-1 ring-red-400/20",
  info: "bg-[#ff5a1f]/15 text-orange-100 ring-1 ring-[#ff5a1f]/25"
} as const;

export function StatusBadge({ children, tone = "neutral" }: { children: string; tone?: keyof typeof tones }) {
  return <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-[11px] font-black", tones[tone])}>{children}</span>;
}
