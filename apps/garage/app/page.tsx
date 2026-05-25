import { readDashboardData, serviceClient } from "@mechconnect/supabase";
import { AppShell, Card, DispatchSkeleton, LinkButton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { BarChart3, Bike, MapPinned, Star, UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

type GarageMechanic = { id: string; name: string; status: string; jobs: number; rating: string };
type GarageDashboard = {
  mechanics: GarageMechanic[];
  metrics: { revenue: number; activeJobs: number; utilization: number; roadsideJobs: number; serviceZones: number };
};

const emptyDashboard: GarageDashboard = {
  mechanics: [],
  metrics: { revenue: 0, activeJobs: 0, utilization: 0, roadsideJobs: 0, serviceZones: 0 }
};

function rupees(value: number) {
  return `Rs.${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function titleCase(value: string | null | undefined) {
  return (value ?? "unknown").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function loadGarageDashboard() {
  return readDashboardData(emptyDashboard, async () => {
    const supabase = serviceClient();
    const [mechanicsResult, requestsResult, paymentsResult, ratingsResult, garagesResult] = await Promise.all([
      supabase.from("mechanics").select("id, status, garage_id, profiles:profile_id(full_name)").order("updated_at", { ascending: false }),
      supabase.from("service_requests").select("id, status, service_type, garage_id, assigned_mechanic_id"),
      supabase.from("payments").select("amount, status"),
      supabase.from("ratings").select("mechanic_id, rating"),
      supabase.from("garages").select("city")
    ]);

    for (const result of [mechanicsResult, requestsResult, paymentsResult, ratingsResult, garagesResult]) {
      if (result.error) throw result.error;
    }

    const requestRows = (requestsResult.data ?? []) as Array<{ status: string; service_type: string; garage_id: string | null; assigned_mechanic_id: string | null }>;
    const ratingRows = (ratingsResult.data ?? []) as Array<{ mechanic_id: string | null; rating: number }>;
    const mechanicRows = (mechanicsResult.data ?? []) as Array<{ id: string; status: string; profiles?: { full_name?: string } | null }>;

    const mechanics = mechanicRows.map((mechanic) => {
      const ratings = ratingRows.filter((rating) => rating.mechanic_id === mechanic.id);
      return {
        id: mechanic.id,
        name: mechanic.profiles?.full_name ?? "Unnamed mechanic",
        status: titleCase(mechanic.status),
        jobs: requestRows.filter((request) => request.assigned_mechanic_id === mechanic.id).length,
        rating: ratings.length > 0 ? (ratings.reduce((sum, row) => sum + row.rating, 0) / ratings.length).toFixed(1) : "-"
      };
    });

    const activeStatuses = ["submitted", "assigned", "accepted", "in_progress", "completed_pending_payment", "payment_pending_verification"];
    const activeMechanics = mechanicRows.filter((mechanic) => ["online", "busy", "emergency_duty"].includes(mechanic.status)).length;
    const cities = new Set(((garagesResult.data ?? []) as Array<{ city: string | null }>).map((garage) => garage.city).filter(Boolean));

    return {
      mechanics,
      metrics: {
        revenue: ((paymentsResult.data ?? []) as Array<{ amount: number; status: string }>).filter((payment) => payment.status === "verified").reduce((sum, payment) => sum + payment.amount, 0),
        activeJobs: requestRows.filter((request) => activeStatuses.includes(request.status)).length,
        utilization: mechanicRows.length > 0 ? Math.round((activeMechanics / mechanicRows.length) * 100) : 0,
        roadsideJobs: requestRows.filter((request) => request.service_type === "roadside_assistance").length,
        serviceZones: cities.size
      }
    };
  });
}

export default async function GarageHome() {
  const { data: dashboard, error } = await loadGarageDashboard();

  return (
    <AppShell
      role="Garage Owner App"
      title="Garage floor control in one glance"
      subtitle="Track mechanics, live jobs, verified revenue, payouts, and performance with a compact dashboard built for busy garage owners."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Garage revenue" value={rupees(dashboard.metrics.revenue)} detail="Verified payments only" />
        <MetricCard label="Active jobs" value={String(dashboard.metrics.activeJobs)} detail="Submitted through payment verification" />
        <MetricCard label="Mechanic utilization" value={`${dashboard.metrics.utilization}%`} detail="Online plus busy mechanic time" />
      </div>
      {error ? <Card className="mt-4 border-amber-400/20 bg-amber-400/10 text-sm text-amber-100">Connect Supabase env vars to load live garage rows. Current dashboard is showing empty states.</Card> : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card id="jobs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Mechanic roster</h2>
              <p className="text-sm text-zinc-400">Live duty state and daily output.</p>
            </div>
            <LinkButton href="mailto:admin@mechconnect.in?subject=Add%20mechanic%20to%20garage" icon={<UserPlus size={16} />}>Add mechanic</LinkButton>
          </div>
          <div className="grid gap-3">
            {dashboard.mechanics.length > 0 ? dashboard.mechanics.map((mechanic) => (
              <div className="grid gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[1fr_auto]" key={mechanic.id}>
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-[12px] bg-[#ff5a1f]/15 text-sm font-black text-orange-200 shadow-sm">{mechanic.name.split(" ").map((part) => part[0]).join("")}</div>
                  <div>
                    <p className="font-black">{mechanic.name}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <StatusBadge tone={mechanic.status === "Online" ? "good" : mechanic.status === "Busy" ? "warn" : "neutral"}>{mechanic.status}</StatusBadge>
                      <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-500" /> {mechanic.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs font-black sm:min-w-40">
                  <div className="rounded-[12px] bg-[#0f0d0b] p-2">
                    <p className="text-zinc-400">Jobs</p>
                    <p className="text-base text-white">{mechanic.jobs}</p>
                  </div>
                  <div className="rounded-[12px] bg-[#0f0d0b] p-2">
                    <p className="text-zinc-400">Share</p>
                    <p className="text-base text-emerald-700">Live</p>
                  </div>
                </div>
              </div>
            )) : <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm font-semibold text-zinc-400">No mechanics found in Supabase yet.</div>}
          </div>
        </Card>
        <Card className="space-y-4" id="wallet">
          <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#ff5a1f]/15 text-orange-200">
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 className="font-black">Performance model</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">Profit views use verified transactions, mechanic payout rules, and service history so garages cannot inflate revenue by marking unverified QR or cash payments as final.</p>
          </div>
          <DispatchSkeleton title="Syncing workforce status" />
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-[12px] bg-white/10 p-3 font-bold">
              <span className="flex items-center gap-2"><Bike size={16} /> Roadside jobs</span>
              <span>{dashboard.metrics.roadsideJobs}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] bg-white/10 p-3 font-bold">
              <span className="flex items-center gap-2"><MapPinned size={16} /> Service zones</span>
              <span>{dashboard.metrics.serviceZones}</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
