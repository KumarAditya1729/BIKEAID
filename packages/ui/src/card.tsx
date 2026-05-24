import { clsx } from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg border border-zinc-200 bg-white p-4 shadow-sm", className)} {...props} />;
}

export function MetricCard({ label, value, detail }: { label: string; value: string; detail?: ReactNode }) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-950">{value}</p>
      {detail ? <div className="mt-2 text-sm text-zinc-600">{detail}</div> : null}
    </Card>
  );
}
