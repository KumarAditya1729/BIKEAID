import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/70", className)} {...props} />;
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: ReactNode }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-orange-50" />
      <p className="relative text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="relative mt-2 text-2xl font-black text-zinc-950">{value}</p>
      {detail ? <div className="mt-2 text-sm text-zinc-600">{detail}</div> : null}
    </Card>
  );
}
