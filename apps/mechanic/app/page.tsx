import { AppShell, Button, Card, MetricCard, StatusBadge } from "@mechconnect/ui";
import { Camera, CheckCircle2, MessageCircle, Navigation, XCircle } from "lucide-react";

const jobs = [
  { id: "MC-1042", type: "Roadside", bike: "150cc", area: "HSR Layout", payout: "Rs.210", status: "Assigned" },
  { id: "MC-1038", type: "Home service", bike: "350cc", area: "Indiranagar", payout: "Rs.420", status: "Completed" }
];

export default function MechanicHome() {
  return (
    <AppShell
      role="Mechanic Partner App"
      title="Fast job handling for mechanics in the field"
      subtitle="Accept work, switch availability, navigate through WhatsApp, upload before/after photos, verify OTP, and track earnings without operational clutter."
    >
      <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="grid gap-4">
          <Card>
            <h2 className="mb-3 font-bold">Availability</h2>
            <div className="grid grid-cols-2 gap-2">
              {["Online", "Busy", "Offline", "Emergency duty"].map((status, index) => (
                <Button key={status} variant={index === 0 ? "primary" : "secondary"}>
                  {status}
                </Button>
              ))}
            </div>
          </Card>
          <MetricCard label="Today earnings" value="Rs.630" detail="2 completed jobs, 1 payment pending verification" />
          <MetricCard label="Rating" value="4.8/5" detail="Based on verified service completions" />
        </div>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Assigned jobs</h2>
            <StatusBadge tone="good">Online</StatusBadge>
          </div>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div className="rounded-md border border-zinc-200 p-3" key={job.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{job.id} · {job.type}</p>
                    <p className="text-sm text-zinc-600">{job.bike} bike near {job.area}</p>
                  </div>
                  <StatusBadge tone={job.status === "Completed" ? "good" : "info"}>{job.status}</StatusBadge>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <Button variant="secondary" icon={<CheckCircle2 size={16} />}>Accept</Button>
                  <Button variant="ghost" icon={<XCircle size={16} />}>Reject</Button>
                  <Button variant="secondary" icon={<Navigation size={16} />}>Navigate</Button>
                  <Button variant="secondary" icon={<Camera size={16} />}>Photos</Button>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-md bg-zinc-50 p-3 text-sm">
                  <span>Mechanic earning</span>
                  <strong>{job.payout}</strong>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" icon={<MessageCircle size={18} />}>Open customer WhatsApp thread</Button>
        </Card>
      </div>
    </AppShell>
  );
}
