import { AppShell, Button, Card, DispatchSkeleton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { AlertTriangle, CheckCheck, Eye, IndianRupee, ShieldAlert } from "lucide-react";

const queues = [
  { name: "Mechanic verification approvals", count: 12, tone: "warn" as const },
  { name: "Manual payment verification", count: 31, tone: "info" as const },
  { name: "Open disputes", count: 4, tone: "bad" as const },
  { name: "Fraud detection logs", count: 8, tone: "warn" as const }
];

const requests = [
  { id: "MC-1042", customer: "Ananya R", garage: "HSR Moto Care", status: "Assigned", payment: "Pending" },
  { id: "MC-1041", customer: "Karthik S", garage: "Rapid Bikes", status: "Completed", payment: "Verified" },
  { id: "MC-1040", customer: "Mohan V", garage: "Indira Wheels", status: "Disputed", payment: "Disputed" }
];

export default function AdminHome() {
  return (
    <AppShell
      role="Super Admin Dashboard"
      title="Dispatch, payments, disputes, and approvals"
      subtitle="A command center for live service operations with fast queues, manual payment verification, fraud signals, and garage performance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross verified revenue" value="Rs.2.8L" detail="Cash and QR after admin verification" />
        <MetricCard label="Live requests" value="48" detail="Submitted through in-progress" />
        <MetricCard label="Cancellation rate" value="6.2%" detail="Tracked for dispatch quality" />
        <MetricCard label="Avg response" value="18m" detail="Manual dispatch benchmark" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="mb-1 font-black">Operations queues</h2>
          <p className="mb-4 text-sm text-zinc-400">Clear the highest-risk work first.</p>
          <div className="grid gap-3">
            {queues.map((queue) => (
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3" key={queue.name}>
                <div>
                  <span className="text-sm font-black">{queue.name}</span>
                  <p className="mt-1 text-xs font-semibold text-zinc-400">Tap to review assigned evidence</p>
                </div>
                <span className="rounded-md bg-red-500/15 px-3 py-2 text-lg font-black text-red-200 shadow-sm">{queue.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <DispatchSkeleton title="Loading audit evidence" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button icon={<CheckCheck size={16} />}>Verify</Button>
            <Button variant="secondary" icon={<ShieldAlert size={16} />}>Audit</Button>
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Live request visibility</h2>
              <p className="text-sm text-zinc-400">Scan assignments, payments, and disputes.</p>
            </div>
            <Button variant="secondary" icon={<Eye size={16} />}>Open console</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr><th className="py-2">Request</th><th>Customer</th><th>Garage</th><th>Status</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr className="border-b border-white/10" key={request.id}>
                    <td className="py-3 font-mono text-xs">{request.id}</td>
                    <td>{request.customer}</td>
                    <td>{request.garage}</td>
                    <td><StatusBadge tone={request.status === "Disputed" ? "bad" : "info"}>{request.status}</StatusBadge></td>
                    <td><StatusBadge tone={request.payment === "Verified" ? "good" : request.payment === "Disputed" ? "bad" : "warn"}>{request.payment}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="flex gap-3">
          <IndianRupee className="text-emerald-600" />
          <p className="text-sm leading-6 text-zinc-300">No Razorpay in MVP: every cash or QR payment creates an immutable transaction row, then admin verification changes payment status.</p>
        </Card>
        <Card className="flex gap-3">
          <AlertTriangle className="text-amber-600" />
          <p className="text-sm leading-6 text-zinc-300">Fraud logs capture suspicious repeated cancellations, OTP mismatches, disputed collections, and mechanic photo upload anomalies.</p>
        </Card>
      </div>
    </AppShell>
  );
}
