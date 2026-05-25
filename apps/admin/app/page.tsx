import { readDashboardData, serviceClient } from "@mechconnect/supabase";
import { AppShell, Card, DispatchSkeleton, LinkButton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { AlertTriangle, CheckCheck, Eye, IndianRupee, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

type QueueTone = "warn" | "info" | "bad";
type AdminRequest = { id: string; customer: string; garage: string; status: string; payment: string };
type AdminDashboard = {
  metrics: {
    verifiedRevenue: number;
    liveRequests: number;
    cancellationRate: number;
    completedRequests: number;
  };
  queues: Array<{ name: string; count: number; tone: QueueTone }>;
  requests: AdminRequest[];
};

const emptyDashboard: AdminDashboard = {
  metrics: { verifiedRevenue: 0, liveRequests: 0, cancellationRate: 0, completedRequests: 0 },
  queues: [
    { name: "Mechanic verification approvals", count: 0, tone: "warn" },
    { name: "Manual payment verification", count: 0, tone: "info" },
    { name: "Open disputes", count: 0, tone: "bad" },
    { name: "Fraud detection logs", count: 0, tone: "warn" }
  ],
  requests: []
};

function rupees(value: number) {
  return `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function titleCase(value: string | null | undefined) {
  return (value ?? "unknown").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function loadAdminDashboard() {
  return readDashboardData(emptyDashboard, async () => {
    const supabase = serviceClient();

    const [
      unverifiedMechanics,
      pendingPayments,
      openDisputes,
      fraudLogs,
      verifiedPayments,
      allRequests,
      recentRequests
    ] = await Promise.all([
      supabase.from("mechanics").select("id", { count: "exact", head: true }).eq("is_verified", false),
      supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("disputes").select("id", { count: "exact", head: true }).in("status", ["open", "investigating"]),
      supabase.from("fraud_logs").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("amount").eq("status", "verified"),
      supabase.from("service_requests").select("id, status"),
      supabase
        .from("service_requests")
        .select("id, status, created_at, profiles:customer_id(full_name), garages:garage_id(name), payments(status)")
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    for (const result of [unverifiedMechanics, pendingPayments, openDisputes, fraudLogs, verifiedPayments, allRequests, recentRequests]) {
      if (result.error) throw result.error;
    }

    const requestRows = (allRequests.data ?? []) as Array<{ id: string; status: string }>;
    const verifiedRevenue = ((verifiedPayments.data ?? []) as Array<{ amount: number }>).reduce((sum, payment) => sum + payment.amount, 0);
    const cancelled = requestRows.filter((request) => request.status === "cancelled").length;
    const completed = requestRows.filter((request) => request.status === "completed").length;
    const liveRequests = requestRows.filter((request) => !["completed", "cancelled"].includes(request.status)).length;

    const requests = ((recentRequests.data ?? []) as Array<{
      id: string;
      status: string;
      profiles?: { full_name?: string } | null;
      garages?: { name?: string } | null;
      payments?: Array<{ status?: string }> | { status?: string } | null;
    }>).map((request) => {
      const payment = Array.isArray(request.payments) ? request.payments[0] : request.payments;
      return {
        id: request.id.slice(0, 8),
        customer: request.profiles?.full_name ?? "Unassigned customer",
        garage: request.garages?.name ?? "Not assigned",
        status: titleCase(request.status),
        payment: titleCase(payment?.status ?? "not_collected")
      };
    });

    return {
      metrics: {
        verifiedRevenue,
        liveRequests,
        cancellationRate: requestRows.length > 0 ? Number(((cancelled / requestRows.length) * 100).toFixed(1)) : 0,
        completedRequests: completed
      },
      queues: [
        { name: "Mechanic verification approvals", count: unverifiedMechanics.count ?? 0, tone: "warn" },
        { name: "Manual payment verification", count: pendingPayments.count ?? 0, tone: "info" },
        { name: "Open disputes", count: openDisputes.count ?? 0, tone: "bad" },
        { name: "Fraud detection logs", count: fraudLogs.count ?? 0, tone: "warn" }
      ],
      requests
    };
  });
}

export default async function AdminHome() {
  const { data: dashboard, error } = await loadAdminDashboard();

  return (
    <AppShell
      role="Super Admin Dashboard"
      title="Dispatch, payments, disputes, and approvals"
      subtitle="A command center for live service operations with fast queues, manual payment verification, fraud signals, and garage performance."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross verified revenue" value={rupees(dashboard.metrics.verifiedRevenue)} detail="Cash and QR after admin verification" />
        <MetricCard label="Live requests" value={String(dashboard.metrics.liveRequests)} detail="Submitted through disputed" />
        <MetricCard label="Cancellation rate" value={`${dashboard.metrics.cancellationRate}%`} detail="Tracked from real service requests" />
        <MetricCard label="Completed services" value={String(dashboard.metrics.completedRequests)} detail="Verified completed request rows" />
      </div>
      {error ? <Card className="mt-4 border-amber-400/20 bg-amber-400/10 text-sm text-amber-100">Connect Supabase env vars to load live production rows. Current dashboard is showing empty states.</Card> : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card id="operations-queues">
          <h2 className="mb-1 font-black">Operations queues</h2>
          <p className="mb-4 text-sm text-zinc-400">Clear the highest-risk work first.</p>
          <div className="grid gap-3">
            {dashboard.queues.map((queue) => (
              <div className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.04] p-3" key={queue.name}>
                <div>
                  <span className="text-sm font-black">{queue.name}</span>
                  <p className="mt-1 text-xs font-semibold text-zinc-400">Tap to review assigned evidence</p>
                </div>
                <span className="rounded-[12px] bg-[#ff5a1f]/15 px-3 py-2 text-lg font-black text-orange-200 shadow-sm">{queue.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <DispatchSkeleton title="Loading audit evidence" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <LinkButton href="#live-requests" icon={<CheckCheck size={16} />}>Verify</LinkButton>
            <LinkButton href="#audit-evidence" icon={<ShieldAlert size={16} />} variant="secondary">Audit</LinkButton>
          </div>
        </Card>
        <Card id="live-requests">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Live request visibility</h2>
              <p className="text-sm text-zinc-400">Scan assignments, payments, and disputes.</p>
            </div>
            <LinkButton href="#live-requests" icon={<Eye size={16} />} variant="secondary">Open console</LinkButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-white/10 text-zinc-400">
                <tr><th className="py-2">Request</th><th>Customer</th><th>Garage</th><th>Status</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {dashboard.requests.length > 0 ? dashboard.requests.map((request) => (
                  <tr className="border-b border-white/10" key={request.id}>
                    <td className="py-3 font-mono text-xs">{request.id}</td>
                    <td>{request.customer}</td>
                    <td>{request.garage}</td>
                    <td><StatusBadge tone={request.status === "Disputed" ? "bad" : "info"}>{request.status}</StatusBadge></td>
                    <td><StatusBadge tone={request.payment === "Verified" ? "good" : request.payment === "Disputed" ? "bad" : "warn"}>{request.payment}</StatusBadge></td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-6 text-center text-zinc-400" colSpan={5}>No service requests found in Supabase yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="flex gap-3" id="wallet">
          <IndianRupee className="text-emerald-600" />
          <p className="text-sm leading-6 text-zinc-300">No Razorpay in MVP: every cash or QR payment creates an immutable transaction row, then admin verification changes payment status.</p>
        </Card>
        <Card className="flex gap-3" id="audit-evidence">
          <AlertTriangle className="text-amber-600" />
          <p className="text-sm leading-6 text-zinc-300">Fraud logs capture suspicious repeated cancellations, OTP mismatches, disputed collections, and mechanic photo upload anomalies.</p>
        </Card>
      </div>
    </AppShell>
  );
}
