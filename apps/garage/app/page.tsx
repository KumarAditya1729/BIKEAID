import { AppShell, Button, Card, MetricCard, StatusBadge } from "@mechconnect/ui";
import { BarChart3, Bike, MapPinned, UserPlus } from "lucide-react";

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
              <p className="text-sm text-zinc-500">Live duty state and daily output.</p>
            </div>
            <Button icon={<UserPlus size={16} />}>Add mechanic</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr><th className="py-2">Name</th><th>Status</th><th>Jobs</th><th>Rating</th></tr>
              </thead>
              <tbody>
                {mechanics.map((mechanic) => (
                  <tr className="border-b border-orange-50" key={mechanic.name}>
                    <td className="py-3 font-bold">{mechanic.name}</td>
                    <td><StatusBadge tone={mechanic.status === "Online" ? "good" : mechanic.status === "Busy" ? "warn" : "neutral"}>{mechanic.status}</StatusBadge></td>
                    <td>{mechanic.jobs}</td>
                    <td>{mechanic.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex size-12 items-center justify-center rounded-md bg-orange-50 text-orange-700">
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 className="font-black">Performance model</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">Profit views use verified transactions, mechanic payout rules, and service history so garages cannot inflate revenue by marking unverified QR or cash payments as final.</p>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-md bg-orange-50 p-3 font-bold">
              <span className="flex items-center gap-2"><Bike size={16} /> Roadside jobs</span>
              <span>42</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-orange-50 p-3 font-bold">
              <span className="flex items-center gap-2"><MapPinned size={16} /> Service zones</span>
              <span>6</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
