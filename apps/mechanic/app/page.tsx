import { AppShell, Button, Card, DispatchSkeleton, MetricCard, StatusBadge } from "@mechconnect/ui";
import { Camera, CheckCircle2, IndianRupee, MapPin, MessageCircle, Navigation, PhoneCall, Timer, XCircle, Zap } from "lucide-react";

const jobs = [
  { id: "MC-1042", type: "Roadside", bike: "150cc", area: "HSR Layout", payout: "Rs.210", status: "Assigned" },
  { id: "MC-1038", type: "Home service", bike: "350cc", area: "Indiranagar", payout: "Rs.420", status: "Completed" }
];

export default function MechanicHome() {
  return (
    <AppShell
      role="Mechanic Partner App"
      title="Your jobs, route, photos, and earnings"
      subtitle="A field-first mechanic console with large actions, quick availability, WhatsApp navigation, before/after proof, OTP completion, and verified payouts."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Next pickup" value="HSR Layout" detail="Roadside rescue, 2.4 km away" />
        <MetricCard label="Cash/QR pending" value="Rs.1,180" detail="Admin verification queue" />
        <MetricCard label="Emergency duty" value="On" detail="Priority roadside assignment" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black">Availability</h2>
              <StatusBadge tone="good">Online</StatusBadge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Online", "Busy", "Offline", "Emergency duty"].map((status, index) => (
                <Button key={status} variant={index === 0 ? "primary" : "secondary"}>
                  {status}
                </Button>
              ))}
            </div>
          </Card>
          <Card className="bg-zinc-950 text-white">
            <p className="text-xs font-black uppercase tracking-wide text-red-100">Today earnings</p>
            <p className="mt-2 text-3xl font-black">Rs.630</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
              <span className="rounded-md bg-white/10 p-2">2 completed</span>
              <span className="rounded-md bg-white/10 p-2">1 pending</span>
            </div>
          </Card>
          <MetricCard label="Rating" value="4.8/5" detail="Based on verified service completions" />
        </div>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-black">Assigned jobs</h2>
              <p className="text-sm text-zinc-400">Accept, navigate, capture proof, and close.</p>
            </div>
            <StatusBadge tone="warn">2 jobs</StatusBadge>
          </div>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3" key={job.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-black">{job.id} · {job.type}</p>
                    <p className="text-sm text-zinc-400">{job.bike} bike near {job.area}</p>
                  </div>
                  <StatusBadge tone={job.status === "Completed" ? "good" : "info"}>{job.status}</StatusBadge>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-[#090b10] p-3 text-sm font-bold text-zinc-200">
                  <MapPin size={17} className="text-red-600" />
                  Customer shared live location via WhatsApp
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <Button variant="secondary" icon={<CheckCircle2 size={16} />}>Accept</Button>
                  <Button variant="ghost" icon={<XCircle size={16} />}>Reject</Button>
                  <Button variant="secondary" icon={<Navigation size={16} />}>Navigate</Button>
                  <Button variant="secondary" icon={<Camera size={16} />}>Photos</Button>
                </div>
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
            ))}
          </div>
          <div className="mt-4">
            <DispatchSkeleton title="Uploading proof skeleton" />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button icon={<MessageCircle size={18} />}>Open WhatsApp</Button>
            <Button variant="secondary" icon={<PhoneCall size={18} />}>Call customer</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
