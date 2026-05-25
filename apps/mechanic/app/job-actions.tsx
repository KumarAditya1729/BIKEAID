"use client";

import { getBrowserSupabase } from "@mechconnect/supabase";
import { Button } from "@mechconnect/ui";
import { Camera, CheckCircle2, Navigation, XCircle } from "lucide-react";
import { useState } from "react";

async function authHeader() {
  const { data } = await getBrowserSupabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    window.location.href = "/login";
    throw new Error("Sign in required");
  }
  return { authorization: `Bearer ${token}`, "content-type": "application/json" };
}

export function AvailabilityButtons() {
  const [message, setMessage] = useState<string | null>(null);

  async function update(status: string) {
    setMessage(null);
    const response = await fetch("/api/availability", {
      method: "PATCH",
      headers: await authHeader(),
      body: JSON.stringify({ status })
    });
    setMessage(response.ok ? `Availability updated to ${status}.` : "Unable to update availability.");
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["online", "Online"],
          ["busy", "Busy"],
          ["offline", "Offline"],
          ["emergency_duty", "Emergency duty"]
        ].map(([value, label], index) => (
          <Button key={value} onClick={() => update(value)} type="button" variant={index === 0 ? "primary" : "secondary"}>
            {label}
          </Button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-zinc-300">{message}</p> : null}
    </>
  );
}

export function MechanicJobActions({ requestId, pickupAddress }: { requestId: string; pickupAddress: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function post(path: string, body: Record<string, string>) {
    setMessage(null);
    const response = await fetch(path, {
      method: "POST",
      headers: await authHeader(),
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Action completed." : payload.error ?? "Action failed.");
  }

  async function preparePhoto() {
    await post("/api/photos/sign", { requestId, phase: "before", contentType: "image/jpeg" });
  }

  return (
    <>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Button icon={<CheckCircle2 size={16} />} onClick={() => post("/api/jobs/accept", { requestId })} type="button" variant="secondary">Accept</Button>
        <Button icon={<XCircle size={16} />} onClick={() => post("/api/jobs/reject", { requestId, reason: "Rejected from mechanic dashboard" })} type="button" variant="ghost">Reject</Button>
        <Button icon={<Navigation size={16} />} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Navigate to: ${pickupAddress}`)}`, "_blank", "noopener,noreferrer")} type="button" variant="secondary">Navigate</Button>
        <Button icon={<Camera size={16} />} onClick={preparePhoto} type="button" variant="secondary">Photos</Button>
      </div>
      {message ? <p className="mt-3 rounded-md bg-white/10 p-3 text-sm font-semibold text-zinc-200">{message}</p> : null}
    </>
  );
}
