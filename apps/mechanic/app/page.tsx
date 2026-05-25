import { readDashboardData, serviceClient } from "@mechconnect/supabase";
import { AppShell, Card, DispatchSkeleton, LinkButton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { IndianRupee, MapPin, MessageCircle, PhoneCall, Timer, Zap } from "lucide-react";
import { AvailabilityButtons, MechanicJobActions } from "./job-actions";

export const dynamic = "force-dynamic";

type MechanicJob = { id: string; shortId: string; type: string; bike: string; area: string; payout: string; status: string; whatsappNumber: string };
type MechanicDashboard = {
  jobs: MechanicJob[];
  metrics: {
    nextPickup: string;
    pendingCollections: number;
    emergencyDuty: string;
    todayEarnings: number;
    completedJobs: number;
    pendingPayments: number;
    rating: string;
  };
};

const emptyDashboard: MechanicDashboard = {
  jobs: [],
  metrics: {
    nextPickup: "No job",
    pendingCollections: 0,
    emergencyDuty: "Off",
    todayEarnings: 0,
    completedJobs: 0,
    pendingPayments: 0,
    rating: "No ratings"
  }
};

function rupees(value: number) {
  return `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function titleCase(value: string | null | undefined) {
  return (value ?? "unknown").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function loadMechanicDashboard() {
  return readDashboardData(emptyDashboard, async () => {
    const supabase = serviceClient();
    const [requestsResult, paymentsResult, ratingsResult, emergencyResult] = await Promise.all([
      supabase
        .from("service_requests")
        .select("id, service_type, bike_category, pickup_address, estimated_total, status, whatsapp_number, created_at")
        .not("assigned_mechanic_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("payments").select("amount, status, created_at"),
      supabase.from("ratings").select("rating"),
      supabase.from("mechanics").select("emergency_enabled").eq("emergency_enabled", true)
    ]);

    for (const result of [requestsResult, paymentsResult, ratingsResult, emergencyResult]) {
      if (result.error) throw result.error;
    }

    const requestRows = (requestsResult.data ?? []) as Array<{
      id: string;
      service_type: string;
      bike_category: string;
      pickup_address: string;
      estimated_total: number;
      status: string;
    }>;
    const paymentRows = (paymentsResult.data ?? []) as Array<{ amount: number; status: string; created_at: string }>;
    const ratingRows = (ratingsResult.data ?? []) as Array<{ rating: number }>;
    const today = new Date().toISOString().slice(0, 10);

    return {
      jobs: requestRows.map((job) => ({
        id: job.id,
        shortId: job.id.slice(0, 8),
        type: titleCase(job.service_type),
        bike: job.bike_category,
        area: job.pickup_address,
        payout: rupees(Math.round(job.estimated_total * 0.6)),
        status: titleCase(job.status),
        whatsappNumber: (job as { whatsapp_number?: string }).whatsapp_number ?? ""
      })),
      metrics: {
        nextPickup: requestRows[0]?.pickup_address?.slice(0, 28) ?? "No job",
        pendingCollections: paymentRows.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0),
        emergencyDuty: (emergencyResult.data ?? []).length > 0 ? "On" : "Off",
        todayEarnings: paymentRows
          .filter((payment) => payment.status === "verified" && payment.created_at?.startsWith(today))
          .reduce((sum, payment) => sum + Math.round(payment.amount * 0.6), 0),
        completedJobs: requestRows.filter((job) => job.status === "completed").length,
        pendingPayments: paymentRows.filter((payment) => payment.status === "pending").length,
        rating: ratingRows.length > 0 ? `${(ratingRows.reduce((sum, row) => sum + row.rating, 0) / ratingRows.length).toFixed(1)}/5` : "No ratings"
      }
    };
  });
}

export default async function MechanicHome() {
  const { data: dashboard, error } = await loadMechanicDashboard();

  return (
    <AppShell
      role="Mechanic Partner App"
      title="Your jobs, route, photos, and earnings"
      subtitle="A field-first mechanic console with large actions, quick availability, WhatsApp navigation, before/after proof, OTP completion, and verified payouts."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Next pickup" value={dashboard.metrics.nextPickup} detail="Latest assigned service request" />
        <MetricCard label="Cash/QR pending" value={rupees(dashboard.metrics.pendingCollections)} detail="Admin verification queue" />
        <MetricCard label="Emergency duty" value={dashboard.metrics.emergencyDuty} detail="Any mechanic marked for emergency duty" />
      </div>
      {error ? <Card className="mb-4 border-amber-400/20 bg-amber-400/10 text-sm text-amber-100">Connect Supabase env vars to load live mechanic rows. Current dashboard is showing empty states.</Card> : null}
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Availability</h2>
              <StatusBadge tone="good">Online</StatusBadge>
            </div>
            <AvailabilityButtons />
          </Card>
          <Card className="bg-zinc-950 text-white">
            <p className="text-xs font-black uppercase tracking-wide text-red-100">Today earnings</p>
            <p className="mt-2 text-3xl font-black">{rupees(dashboard.metrics.todayEarnings)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
              <span className="rounded-md bg-white/10 p-2">{dashboard.metrics.completedJobs} completed</span>
              <span className="rounded-md bg-white/10 p-2">{dashboard.metrics.pendingPayments} pending</span>
            </div>
          </Card>
          <MetricCard label="Rating" value={dashboard.metrics.rating} detail="Based on verified service completions" />
        </div>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Assigned jobs</h2>
              <p className="text-sm text-zinc-400">Accept, navigate, capture proof, and close.</p>
            </div>
            <StatusBadge tone="warn">{`${dashboard.jobs.length} jobs`}</StatusBadge>
          </div>
          <div className="space-y-3">
            {dashboard.jobs.length > 0 ? dashboard.jobs.map((job) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3" key={job.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-black">{job.shortId} · {job.type}</p>
                    <p className="text-sm text-zinc-400">{job.bike} bike near {job.area}</p>
                  </div>
                  <StatusBadge tone={job.status === "Completed" ? "good" : "info"}>{job.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-[#090b10] p-3 text-sm font-bold text-zinc-200">
                  <MapPin size={17} className="text-red-600" />
                  Customer shared live location via WhatsApp
                </div>
                <MechanicJobActions pickupAddress={job.area} requestId={job.id} />
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-md bg-[#090b10] p-3 font-semibold text-zinc-200">
                    <IndianRupee size={16} className="text-red-600" />
                    {job.payout}
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-[#090b10] p-3 font-semibold text-zinc-200">
                    <Timer size={16} className="text-red-600" />
                    18 min ETA
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-[#090b10] p-3 font-semibold text-zinc-200">
                    <Zap size={16} className="text-red-600" />
                    OTP close
                  </div>
                </div>
              </div>
            )) : <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-center text-sm font-semibold text-zinc-400">No assigned mechanic jobs found in Supabase yet.</div>}
          </div>
          <div className="mt-4">
            <DispatchSkeleton title="Uploading proof skeleton" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <LinkButton href="https://wa.me/" icon={<MessageCircle size={18} />}>Open WhatsApp</LinkButton>
            <LinkButton href="tel:+919876543211" icon={<PhoneCall size={18} />} variant="secondary">Call customer</LinkButton>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
