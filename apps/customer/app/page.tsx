import { quoteService } from "@mechconnect/core";
import { readDashboardData, serviceClient } from "@mechconnect/supabase";
import { AppShell, Button, Card, DispatchSkeleton, StatusBadge } from "@mechconnect/ui";
import { BatteryWarning, CheckCircle2, Clock3, Fuel, MapPin, MessageCircle, ShieldCheck, Sparkles, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

const quote = quoteService("roadside_assistance", "150cc", "within_5km");

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
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Book service</h2>
              <p className="text-sm text-zinc-400">Choose the issue, confirm estimate, then share location.</p>
            </div>
            <StatusBadge tone="info">MVP live</StatusBadge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Puncture", icon: Wrench },
              { label: "Fuel help", icon: Fuel },
              { label: "Battery", icon: BatteryWarning }
            ].map((item, index) => (
              <button className={index === 0 ? "rounded-md bg-red-600 px-3 py-3 text-left text-xs font-black text-white shadow-lg shadow-black/30" : "rounded-md bg-white/10 px-3 py-3 text-left text-xs font-black text-red-100 ring-1 ring-white/10"} key={item.label}>
                <item.icon className="mb-2" size={18} aria-hidden="true" />
              {item.label}
            </button>
          ))}
          </div>
          <div className="rounded-lg border border-white/10 bg-[#090b10] p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide text-zinc-400">Pickup route</p>
              <span className="rounded-md bg-red-500/15 px-2 py-1 text-xs font-black text-red-200">Live location</span>
            </div>
            <div className="relative min-h-32 overflow-hidden rounded-lg bg-[#11151d] p-4">
              <div className="absolute left-7 top-8 h-20 w-0.5 bg-red-500/60" />
              <div className="relative flex items-center gap-3">
                <span className="size-4 rounded-full bg-red-500 ring-4 ring-red-500/20" />
                <div>
                  <p className="text-sm font-black">Customer pickup</p>
                  <p className="text-xs font-semibold text-zinc-400">{dashboard.latestRequest?.pickup ?? "No request submitted yet"}</p>
                </div>
              </div>
              <div className="relative mt-9 flex items-center gap-3">
                <span className="size-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                <div>
                  <p className="text-sm font-black">Assigned mechanic</p>
                  <p className="text-xs font-semibold text-zinc-400">{dashboard.latestRequest ? `${dashboard.latestRequest.mechanic} · ${dashboard.latestRequest.eta}` : "Waiting for first request"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Service type</span>
              <select className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none focus:border-red-500">
                <option>Roadside assistance</option>
                <option>Home bike service</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Bike category</span>
              <select className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none focus:border-red-500" defaultValue="150cc">
                <option>100cc</option>
                <option>150cc</option>
                <option>200-250cc</option>
                <option>350cc</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Distance slab</span>
              <select className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none focus:border-red-500">
                <option>Within 5km - Rs.100</option>
                <option>Within 10km - Rs.200</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">WhatsApp number</span>
              <input className="min-h-12 w-full rounded-md border border-white/10 bg-[#090b10] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500" placeholder="9876543210" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Issue and pickup address</span>
            <textarea
              className="min-h-28 w-full rounded-md border border-white/10 bg-[#090b10] px-3 py-2 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
              placeholder="Bike stopped near Koramangala, fuel available, need urgent help."
            />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button icon={<MapPin size={18} />}>Create service request</Button>
            <Button variant="secondary" icon={<MessageCircle size={18} />}>
              Share live location
            </Button>
          </div>
        </Card>
        <div className="grid gap-4">
          <Card className="overflow-hidden p-0">
            <div className="bg-zinc-950 p-4 text-white">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide text-red-100">Estimated total</span>
                <Sparkles size={18} className="text-amber-300" aria-hidden="true" />
              </div>
              <p className="text-4xl font-black">Rs.{quote.estimatedTotal}</p>
              <p className="mt-1 text-sm font-semibold text-zinc-300">Service Rs.{quote.serviceBasePrice} + visit Rs.{quote.visitingCharge}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 text-center text-xs font-black">
              <div className="rounded-md bg-red-50 p-2 text-red-700">18 min ETA</div>
              <div className="rounded-md bg-amber-50 p-2 text-amber-700">QR/cash</div>
              <div className="rounded-md bg-emerald-50 p-2 text-emerald-700">OTP close</div>
            </div>
          </Card>
          <DispatchSkeleton title="Matching nearby mechanic" />
          <Card>
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
          <Card className="flex items-start gap-3 bg-emerald-400/10">
            <ShieldCheck className="text-emerald-600" size={22} />
            <p className="text-sm leading-6 text-zinc-300">Profiles, requests, ratings, and payments are protected by Supabase Auth plus RLS. Customers only read their own service records.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
