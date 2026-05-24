import { AppShell, Button, Card, DispatchSkeleton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { BarChart3, Bike, MapPinned, Star, UserPlus } from "lucide-react";

const mechanics = [
  { name: "Ravi Kumar", status: "Online", jobs: 7, rating: "4.9" },
  { name: "Imran Shaikh", status: "Busy", jobs: 5, rating: "4.7" },
  { name: "Suresh P", status: "Offline", jobs: 3, rating: "4.5" }
];

export default function GarageHome() {
  return (
    <AppShell
      role="Garage Owner App"
      title="Garage floor control in one glance"
      subtitle="Track mechanics, live jobs, verified revenue, payouts, and performance with a compact dashboard built for busy garage owners."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Garage revenue" value="Rs.18,420" detail="This week, verified payments only" />
        <MetricCard label="Active jobs" value="6" detail="4 roadside, 2 home service" />
        <MetricCard label="Mechanic utilization" value="78%" detail="Online plus busy mechanic time" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Mechanic roster</h2>
              <p className="text-sm text-zinc-400">Live duty state and daily output.</p>
            </div>
            <Button icon={<UserPlus size={16} />}>Add mechanic</Button>
          </div>
          <div className="grid gap-3">
            {mechanics.map((mechanic) => (
              <div className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_auto]" key={mechanic.name}>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-md bg-red-500/15 text-sm font-black text-red-200 shadow-sm">{mechanic.name.split(" ").map((part) => part[0]).join("")}</div>
                  <div>
                    <p className="font-black">{mechanic.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <StatusBadge tone={mechanic.status === "Online" ? "good" : mechanic.status === "Busy" ? "warn" : "neutral"}>{mechanic.status}</StatusBadge>
                      <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-500" /> {mechanic.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-black sm:min-w-40">
                  <div className="rounded-md bg-[#090b10] p-2">
                    <p className="text-zinc-400">Jobs</p>
                    <p className="text-base text-white">{mechanic.jobs}</p>
                  </div>
                  <div className="rounded-md bg-[#090b10] p-2">
                    <p className="text-zinc-400">Share</p>
                    <p className="text-base text-emerald-700">Live</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex size-12 items-center justify-center rounded-md bg-red-500/15 text-red-200">
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 className="font-black">Performance model</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">Profit views use verified transactions, mechanic payout rules, and service history so garages cannot inflate revenue by marking unverified QR or cash payments as final.</p>
          </div>
          <DispatchSkeleton title="Syncing workforce status" />
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-white/10 p-3 font-bold">
              <span className="flex items-center gap-2"><Bike size={16} /> Roadside jobs</span>
              <span>42</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-white/10 p-3 font-bold">
              <span className="flex items-center gap-2"><MapPinned size={16} /> Service zones</span>
              <span>6</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
