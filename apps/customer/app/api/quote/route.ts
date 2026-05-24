import { quoteService, serviceRequestSchema } from "@mechconnect/core";
import { checkRateLimit, getClientIp } from "@mechconnect/supabase/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`quote:${ip}`, 60, 60);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many quote attempts" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
  }

  const payload = await request.json();
  const parsed = serviceRequestSchema.pick({
    serviceType: true,
    bikeCategory: true,
    distanceSlab: true,
    pickupAddress: true,
    issueDescription: true,
    whatsappNumber: true
  }).safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const quote = quoteService(parsed.data.serviceType, parsed.data.bikeCategory, parsed.data.distanceSlab);

  return NextResponse.json({ quote });
}
