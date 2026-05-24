import { quoteService } from "@mechconnect/core";
import { AppShell, Button, Card, StatusBadge } from "@mechconnect/ui";
import { BatteryWarning, CheckCircle2, Clock3, Fuel, MapPin, MessageCircle, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const quote = quoteService("roadside_assistance", "150cc", "within_5km");

export default function CustomerHome() {
  return (
    <AppShell
      role="Customer App"
      title="Bike help delivered to your location"
      subtitle="Book roadside rescue or home service in a few taps, share live location on WhatsApp, and complete the job with OTP verification."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Avg arrival", value: "18 min", icon: Clock3 },
          { label: "Pilot garages", value: "24", icon: Wrench },
          { label: "Verified jobs", value: "1,280+", icon: ShieldCheck }
        ].map((item) => (
          <Card className="flex items-center gap-3" key={item.label}>
            <div className="flex size-11 items-center justify-center rounded-md bg-red-50 text-red-700">
              <item.icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{item.label}</p>
              <p className="text-lg font-black">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 border-red-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Book service</h2>
              <p className="text-sm text-zinc-500">Choose the issue, confirm estimate, then share location.</p>
            </div>
            <StatusBadge tone="info">MVP live</StatusBadge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Puncture", icon: Wrench },
              { label: "Fuel help", icon: Fuel },
              { label: "Battery", icon: BatteryWarning }
            ].map((item, index) => (
              <button className={index === 0 ? "rounded-md bg-red-600 px-3 py-3 text-left text-xs font-black text-white shadow-lg shadow-red-100" : "rounded-md bg-red-50 px-3 py-3 text-left text-xs font-black text-red-700 ring-1 ring-red-100"} key={item.label}>
                <item.icon className="mb-2" size={18} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Service type</span>
              <select className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500">
                <option>Roadside assistance</option>
                <option>Home bike service</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Bike category</span>
              <select className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500" defaultValue="150cc">
                <option>100cc</option>
                <option>150cc</option>
                <option>200-250cc</option>
                <option>350cc</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Distance slab</span>
              <select className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500">
                <option>Within 5km - Rs.100</option>
                <option>Within 10km - Rs.200</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">WhatsApp number</span>
              <input className="min-h-12 w-full rounded-md border border-red-100 bg-red-50/40 px-3 font-semibold outline-none focus:border-red-500" placeholder="9876543210" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Issue and pickup address</span>
            <textarea
              className="min-h-28 w-full rounded-md border border-red-100 bg-red-50/40 px-3 py-2 font-semibold outline-none focus:border-red-500"
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
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Request tracker</h2>
              <StatusBadge tone="info">Submitted</StatusBadge>
            </div>
            <ol className="space-y-3 text-sm text-zinc-700">
              {["Email verified account", "Operations assigns mechanic", "Mechanic navigates via WhatsApp", "Customer shares OTP after completion"].map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckCircle2 className="mt-0.5 text-emerald-600" size={17} />
                  {item}
                </li>
              ))}
            </ol>
          </Card>
          <Card className="flex items-start gap-3 bg-emerald-50/60">
            <ShieldCheck className="text-emerald-600" size={22} />
            <p className="text-sm leading-6 text-zinc-600">Profiles, requests, ratings, and payments are protected by Supabase Auth plus RLS. Customers only read their own service records.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
