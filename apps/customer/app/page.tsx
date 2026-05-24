import { quoteService } from "@mechconnect/core";
import { AppShell, Button, Card, MetricCard, StatusBadge } from "@mechconnect/ui";
import { CheckCircle2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

const quote = quoteService("roadside_assistance", "150cc", "within_5km");

export default function CustomerHome() {
  return (
    <AppShell
      role="Customer App"
      title="Request bike help without expensive map dependencies"
      subtitle="A mobile-first customer workflow for roadside assistance, home service, WhatsApp location sharing, OTP completion, ratings, and service history."
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold">Service type</span>
              <select className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3">
                <option>Roadside assistance</option>
                <option>Home bike service</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Bike category</span>
              <select className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3" defaultValue="150cc">
                <option>100cc</option>
                <option>150cc</option>
                <option>200-250cc</option>
                <option>350cc</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Distance slab</span>
              <select className="min-h-11 w-full rounded-md border border-zinc-300 bg-white px-3">
                <option>Within 5km - Rs.100</option>
                <option>Within 10km - Rs.200</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">WhatsApp number</span>
              <input className="min-h-11 w-full rounded-md border border-zinc-300 px-3" placeholder="9876543210" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Issue and pickup address</span>
            <textarea
              className="min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2"
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
          <MetricCard label="Estimated total" value={`Rs.${quote.estimatedTotal}`} detail={`Service Rs.${quote.serviceBasePrice} + visit Rs.${quote.visitingCharge}`} />
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Current request</h2>
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
          <Card className="flex items-start gap-3">
            <ShieldCheck className="text-emerald-600" size={22} />
            <p className="text-sm leading-6 text-zinc-600">Profiles, requests, ratings, and payments are protected by Supabase Auth plus RLS, so users only read their own operational records.</p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
