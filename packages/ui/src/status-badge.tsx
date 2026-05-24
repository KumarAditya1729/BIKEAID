import { clsx } from "clsx";

const tones = {
  neutral: "bg-zinc-100 text-zinc-700",
  good: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-700"
} as const;

export function StatusBadge({ children, tone = "neutral" }: { children: string; tone?: keyof typeof tones }) {
  return <span className={clsx("inline-flex rounded-md px-2 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
