import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg border border-white/10 bg-[#151922] p-4 text-white shadow-xl shadow-black/20", className)} {...props} />;
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-red-500/10" />
      <p className="relative text-xs font-bold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="relative mt-2 text-2xl font-black text-white">{value}</p>
      {detail ? <div className="mt-2 text-sm text-zinc-400">{detail}</div> : null}
    </Card>
  );
}
