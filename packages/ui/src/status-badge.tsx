import { clsx } from "clsx";

const tones = {
  neutral: "bg-white/10 text-zinc-200 ring-1 ring-white/10",
  good: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
  warn: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20",
  bad: "bg-red-400/10 text-red-300 ring-1 ring-red-400/20",
  info: "bg-red-500/15 text-red-200 ring-1 ring-red-400/20"
} as const;

export function StatusBadge({ children, tone = "neutral" }: { children: string; tone?: keyof typeof tones }) {
  return <span className={clsx("inline-flex rounded-md px-2.5 py-1 text-xs font-black", tones[tone])}>{children}</span>;
}
