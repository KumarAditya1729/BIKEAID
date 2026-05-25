import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("min-w-0 rounded-[14px] border border-white/10 bg-[#15120f] p-4 text-white shadow-xl shadow-black/25", className)} {...props} />;
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: ReactNode }) {
  return (
    <Card className="relative overflow-hidden bg-[#171310]">
      <div className="absolute -right-8 -top-10 size-28 rounded-full bg-[#ff5a1f]/15" />
      <div className="absolute right-3 top-3 size-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
      <p className="relative text-[11px] font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="relative mt-2 text-2xl font-black text-white">{value}</p>
      {detail ? <div className="mt-2 text-xs font-semibold leading-5 text-zinc-400">{detail}</div> : null}
    </Card>
  );
}
