import { readDashboardData, serviceClient } from "@mechconnect/supabase";
import { AppShell, Card, DispatchSkeleton, StatusBadge } from "@mechconnect/ui";
import { CheckCircle2, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { CustomerRequestForm } from "./request-form";

export const dynamic = "force-dynamic";

type CustomerDashboard = {
  stats: { liveRequests: number; garages: number; completedJobs: number };
  latestRequest: {
    status: string;
    pickup: string;
    mechanic: string;
    eta: string;
  } | null;
};

const emptyDashboard: CustomerDashboard = {
  stats: { liveRequests: 0, garages: 0, completedJobs: 0 },
  latestRequest: null
};

function titleCase(value: string | null | undefined) {
  return (value ?? "unknown").split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

async function loadCustomerDashboard() {
  return readDashboardData(emptyDashboard, async () => {
    const supabase = serviceClient();
    const [requestsResult, garagesResult, latestResult] = await Promise.all([
      supabase.from("service_requests").select("id, status"),
      supabase.from("garages").select("id", { count: "exact", head: true }).eq("is_verified", true),
      supabase
        .from("service_requests")
        .select("status, pickup_address, assigned_mechanic_id, mechanics:assigned_mechanic_id(profiles:profile_id(full_name))")
        .order("created_at", { ascending: false })
        .limit(1)
    ]);

    for (const result of [requestsResult, garagesResult, latestResult]) {
      if (result.error) throw result.error;
    }

    const requestRows = (requestsResult.data ?? []) as Array<{ status: string }>;
    const latest = ((latestResult.data ?? []) as Array<{
      status: string;
      pickup_address: string;
      mechanics?: { profiles?: { full_name?: string } | null } | null;
    }>)[0];

    return {
      stats: {
        liveRequests: requestRows.filter((request) => !["completed", "cancelled"].includes(request.status)).length,
        garages: garagesResult.count ?? 0,
        completedJobs: requestRows.filter((request) => request.status === "completed").length
      },
      latestRequest: latest ? {
        status: titleCase(latest.status),
        pickup: latest.pickup_address,
        mechanic: latest.mechanics?.profiles?.full_name ?? "Awaiting assignment",
        eta: latest.mechanics ? "Assigned" : "Pending"
      } : null
    };
  });
}

export default async function CustomerHome() {
  const { data: dashboard, error } = await loadCustomerDashboard();

  return (
    <AppShell
      role="Customer App"
      title="Bike help delivered to your location"
      subtitle="Book roadside rescue or home service in a few taps, share live location on WhatsApp, and complete the job with OTP verification."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Live requests", value: String(dashboard.stats.liveRequests), icon: Clock3 },
          { label: "Verified garages", value: String(dashboard.stats.garages), icon: Wrench },
          { label: "Completed jobs", value: String(dashboard.stats.completedJobs), icon: ShieldCheck }
        ].map((item) => (
          <Card className="flex items-center gap-3" key={item.label}>
            <div className="flex size-11 items-center justify-center rounded-md bg-red-500/10 text-red-200">
              <item.icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">{item.label}</p>
              <p className="text-lg font-black">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>
      {error ? <Card className="mb-4 border-amber-400/20 bg-amber-400/10 text-sm text-amber-100">Connect Supabase env vars to load live customer dashboard rows. Current dashboard is showing empty states.</Card> : null}
      <CustomerRequestForm />
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <DispatchSkeleton title="Matching nearby mechanic" />
        <Card id="jobs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-black">Request tracker</h2>
            <StatusBadge tone="info">{dashboard.latestRequest?.status ?? "No requests"}</StatusBadge>
          </div>
          <ol className="space-y-3 text-sm text-zinc-300">
            {["Email verified account", "Operations assigns mechanic", "Mechanic navigates via WhatsApp", "Customer shares OTP after completion"].map((item) => (
              <li className="flex gap-2" key={item}>
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
                {item}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="flex items-start gap-3 bg-emerald-400/10" id="wallet">
          <ShieldCheck className="text-emerald-600" size={22} />
          <p className="text-sm leading-6 text-zinc-300">Profiles, requests, ratings, and payments are protected by Supabase Auth plus RLS. Customers only read their own service records.</p>
        </Card>
      </div>
    </AppShell>
  );
}
