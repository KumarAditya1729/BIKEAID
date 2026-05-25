"use client";

import { quoteService } from "@mechconnect/core";
import { getBrowserSupabase } from "@mechconnect/supabase";
import { Button, Card, StatusBadge } from "@mechconnect/ui";
import { BatteryWarning, Fuel, MapPin, MessageCircle, Sparkles, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

type ServiceType = "roadside_assistance" | "home_service";
type BikeCategory = "100cc" | "150cc" | "200-250cc" | "350cc";
type DistanceSlab = "within_5km" | "within_10km";

const issueOptions = [
  { label: "Puncture", icon: Wrench, text: "Puncture repair needed" },
  { label: "Fuel help", icon: Fuel, text: "Fuel support needed" },
  { label: "Battery", icon: BatteryWarning, text: "Battery issue support needed" }
];

export function CustomerRequestForm() {
  const [serviceType, setServiceType] = useState<ServiceType>("roadside_assistance");
  const [bikeCategory, setBikeCategory] = useState<BikeCategory>("150cc");
  const [distanceSlab, setDistanceSlab] = useState<DistanceSlab>("within_5km");
  const [whatsappNumber, setWhatsappNumber] = useState("9876543211");
  const [pickupAddress, setPickupAddress] = useState("Koramangala 5th Block, Bengaluru");
  const [issueDescription, setIssueDescription] = useState(issueOptions[0].text);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quote = useMemo(() => quoteService(serviceType, bikeCategory, distanceSlab), [serviceType, bikeCategory, distanceSlab]);

  async function createRequest() {
    setMessage(null);
    setIsSubmitting(true);
    try {
      const { data } = await getBrowserSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setMessage("Sign in first, then create the service request.");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          serviceType,
          bikeCategory,
          distanceSlab,
          whatsappNumber,
          pickupAddress,
          issueDescription
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Unable to create request.");
        return;
      }
      setMessage(`Request created. Completion OTP: ${payload.completionOtp}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function shareLocation() {
    const text = encodeURIComponent(`MechConnect pickup: ${pickupAddress}. Issue: ${issueDescription}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
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
          {issueOptions.map((item) => (
            <button
              className={issueDescription === item.text ? "rounded-[14px] bg-[#ff5a1f] px-3 py-3 text-left text-xs font-black text-white shadow-lg shadow-orange-950/30" : "rounded-[14px] bg-white/10 px-3 py-3 text-left text-xs font-black text-orange-100 ring-1 ring-white/10"}
              key={item.label}
              onClick={() => setIssueDescription(item.text)}
              type="button"
            >
              <item.icon className="mb-2" size={18} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="rounded-[16px] border border-white/10 bg-[#0f0d0b] p-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-400">Pickup route</p>
            <span className="rounded-full bg-[#ff5a1f]/15 px-2 py-1 text-xs font-black text-orange-200">WhatsApp handoff</span>
          </div>
          <div className="relative min-h-32 overflow-hidden rounded-[14px] bg-[#171310] p-4">
            <div className="absolute left-7 top-8 h-20 w-0.5 bg-[#ff5a1f]/60" />
            <div className="relative flex items-center gap-3">
              <span className="size-4 rounded-full bg-[#ff5a1f] ring-4 ring-[#ff5a1f]/20" />
              <div>
                <p className="text-sm font-black">Customer pickup</p>
                <p className="text-xs font-semibold text-zinc-400">{pickupAddress || "Enter pickup address"}</p>
              </div>
            </div>
            <div className="relative mt-9 flex items-center gap-3">
              <span className="size-4 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <div>
                <p className="text-sm font-black">Operations dispatch</p>
                <p className="text-xs font-semibold text-zinc-400">Admin assigns nearest mechanic</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Service type</span>
            <select className="min-h-12 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 font-semibold text-white outline-none focus:border-[#ff5a1f]" onChange={(event) => setServiceType(event.target.value as ServiceType)} value={serviceType}>
              <option value="roadside_assistance">Roadside assistance</option>
              <option value="home_service">Home bike service</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Bike category</span>
            <select className="min-h-12 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 font-semibold text-white outline-none focus:border-[#ff5a1f]" onChange={(event) => setBikeCategory(event.target.value as BikeCategory)} value={bikeCategory}>
              <option>100cc</option>
              <option>150cc</option>
              <option>200-250cc</option>
              <option>350cc</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Distance slab</span>
            <select className="min-h-12 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 font-semibold text-white outline-none focus:border-[#ff5a1f]" onChange={(event) => setDistanceSlab(event.target.value as DistanceSlab)} value={distanceSlab}>
              <option value="within_5km">Within 5km - Rs.100</option>
              <option value="within_10km">Within 10km - Rs.200</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">WhatsApp number</span>
            <input className="min-h-12 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-[#ff5a1f]" onChange={(event) => setWhatsappNumber(event.target.value)} placeholder="9876543210" value={whatsappNumber} />
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-semibold">Issue and pickup address</span>
          <textarea className="min-h-24 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 py-2 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-[#ff5a1f]" onChange={(event) => setPickupAddress(event.target.value)} placeholder="Pickup address" value={pickupAddress} />
        </label>
        <textarea className="min-h-20 w-full rounded-[12px] border border-white/10 bg-[#0f0d0b] px-3 py-2 font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-[#ff5a1f]" onChange={(event) => setIssueDescription(event.target.value)} placeholder="Issue description" value={issueDescription} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={isSubmitting} icon={<MapPin size={18} />} onClick={createRequest} type="button">{isSubmitting ? "Creating..." : "Create service request"}</Button>
          <Button icon={<MessageCircle size={18} />} onClick={shareLocation} type="button" variant="secondary">Share live location</Button>
        </div>
        {message ? <p className="rounded-[12px] bg-white/10 p-3 text-sm font-semibold text-zinc-100">{message}</p> : null}
      </Card>
      <Card className="overflow-hidden p-0">
        <div className="bg-[#0f0d0b] p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wide text-orange-100">Estimated total</span>
            <Sparkles size={18} className="text-amber-300" aria-hidden="true" />
          </div>
          <p className="text-4xl font-black">Rs.{quote.estimatedTotal}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-300">Service Rs.{quote.serviceBasePrice} + visit Rs.{quote.visitingCharge}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3 text-center text-xs font-black">
          <div className="rounded-[12px] bg-orange-50 p-2 text-orange-700">Dispatch ETA</div>
          <div className="rounded-[12px] bg-amber-50 p-2 text-amber-700">QR/cash</div>
          <div className="rounded-[12px] bg-emerald-50 p-2 text-emerald-700">OTP close</div>
        </div>
      </Card>
    </div>
  );
}
