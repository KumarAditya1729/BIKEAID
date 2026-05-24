import { quoteService, serviceRequestSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { checkRateLimit, getClientIp } from "@mechconnect/supabase/rate-limit";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";

function hashOtp(otp: string) {
  const pepper = process.env.OTP_PEPPER ?? "local-development-pepper";
  return createHash("sha256").update(`${otp}:${pepper}`).digest("hex");
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["customer", "admin", "super_admin"]);
    const supabase = getServiceSupabase();

    let query = supabase
      .from("service_requests")
      .select("id, service_type, bike_category, distance_slab, pickup_address, issue_description, status, base_price, visiting_charge, estimated_total, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (auth.profile.role === "customer") {
      query = query.eq("customer_id", auth.userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.requests.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`request:create:${ip}`, 8, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many request attempts" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
    }

    const auth = await requireAuth(request, ["customer"]);
    const input = serviceRequestSchema.parse(await request.json());
    const quote = quoteService(input.serviceType, input.bikeCategory, input.distanceSlab);
    const otp = String(randomInt(100000, 1000000));

    const { data, error } = await getServiceSupabase()
      .from("service_requests")
      .insert({
        customer_id: auth.userId,
        service_type: input.serviceType,
        bike_category: input.bikeCategory,
        distance_slab: input.distanceSlab,
        pickup_address: input.pickupAddress,
        issue_description: input.issueDescription,
        whatsapp_number: input.whatsappNumber,
        base_price: quote.serviceBasePrice,
        visiting_charge: quote.visitingCharge,
        estimated_total: quote.estimatedTotal,
        completion_otp_hash: hashOtp(otp)
      })
      .select("id, status, estimated_total, created_at")
      .single();

    if (error) throw error;
    const requestRow = data as { id: string };

    logEvent("info", "customer.request.created", { requestId: requestRow.id, customerId: auth.userId });

    return NextResponse.json({
      request: data,
      completionOtp: otp,
      warning: "Show this OTP only to the mechanic after service completion."
    }, { status: 201 });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.request.create_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to create request" }, { status: 500 });
  }
}
