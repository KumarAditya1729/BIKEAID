import { clsx } from "clsx";

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={clsx("h-3 animate-pulse rounded-full bg-white/10", className)} />;
}

export function DispatchSkeleton({ title = "Finding best match" }: { title?: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-[#0f0d0b] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-black text-white">{title}</p>
        <span className="size-3 animate-ping rounded-full bg-[#ff5a1f]" />
      </div>
      <div className="space-y-3">
        <SkeletonLine className="w-10/12" />
        <SkeletonLine className="w-7/12" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <SkeletonLine className="h-12 rounded-[12px]" />
          <SkeletonLine className="h-12 rounded-[12px]" />
          <SkeletonLine className="h-12 rounded-[12px]" />
        </div>
      </div>
    </div>
  );
}
