import { clsx } from "clsx";

const tones = {
  neutral: "bg-zinc-100 text-zinc-700",
  good: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  warn: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  bad: "bg-red-50 text-red-700 ring-1 ring-red-100",
  info: "bg-red-50 text-red-700 ring-1 ring-red-100"
} as const;

export function StatusBadge({ children, tone = "neutral" }: { children: string; tone?: keyof typeof tones }) {
  return <span className={clsx("inline-flex rounded-md px-2.5 py-1 text-xs font-black", tones[tone])}>{children}</span>;
}
