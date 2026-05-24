import { completionOtpSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { checkRateLimit, getClientIp } from "@mechconnect/supabase/rate-limit";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

function hashOtp(otp: string) {
  const pepper = process.env.OTP_PEPPER ?? "local-development-pepper";
  return createHash("sha256").update(`${otp}:${pepper}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`otp:${ip}`, 10, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many OTP attempts" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
    }

    const auth = await requireAuth(request, ["mechanic"]);
    const input = completionOtpSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: mechanic, error: mechanicError } = await supabase
      .from("mechanics")
      .select("id")
      .eq("profile_id", auth.userId)
      .single();

    if (mechanicError || !mechanic) {
      return NextResponse.json({ error: "Mechanic profile not found" }, { status: 403 });
    }
    const mechanicRow = mechanic as { id: string };

    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select("id, completion_otp_hash")
      .eq("id", input.requestId)
      .eq("assigned_mechanic_id", mechanicRow.id)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json({ error: "Assigned request not found" }, { status: 404 });
    }

    const serviceRequestRow = serviceRequest as { completion_otp_hash: string | null };

    if (serviceRequestRow.completion_otp_hash !== hashOtp(input.otp)) {
      await supabase.from("fraud_logs").insert({
        actor_id: auth.userId,
        request_id: input.requestId,
        event_type: "otp_mismatch",
        severity: "medium",
        metadata: { mechanicId: mechanicRow.id }
      });
      return NextResponse.json({ error: "Invalid completion OTP" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update({
        status: "completed_pending_payment",
        otp_verified_at: new Date().toISOString()
      })
      .eq("id", input.requestId)
      .select("id, status, otp_verified_at")
      .single();

    if (error) throw error;

    logEvent("info", "mechanic.job.completed", { requestId: input.requestId, mechanicId: mechanicRow.id });
    return NextResponse.json({ request: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.job.complete_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to complete job" }, { status: 500 });
  }
}
