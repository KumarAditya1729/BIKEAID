import { paymentCollectionSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { checkRateLimit, getClientIp } from "@mechconnect/supabase/rate-limit";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`payment:collect:${ip}`, 20, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many payment attempts" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
    }

    const auth = await requireAuth(request, ["mechanic"]);
    const input = paymentCollectionSchema.parse(await request.json());
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
      .select("id, assigned_mechanic_id, status")
      .eq("id", input.requestId)
      .eq("assigned_mechanic_id", mechanicRow.id)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json({ error: "Assigned request not found" }, { status: 404 });
    }

    const serviceRequestRow = serviceRequest as { status: string };

    if (serviceRequestRow.status !== "completed_pending_payment") {
      return NextResponse.json({ error: "Request must be OTP-completed before payment collection" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("payments")
      .upsert({
        request_id: input.requestId,
        method: input.method,
        status: "pending",
        amount: Math.round(input.amount),
        mechanic_id: mechanicRow.id,
        collected_at: new Date().toISOString(),
        reference_note: input.referenceNote
      }, { onConflict: "request_id" })
      .select("id, status, amount, method, collected_at")
      .single();

    if (error) throw error;

    await supabase.from("service_requests").update({ status: "payment_pending_verification" }).eq("id", input.requestId);
    logEvent("info", "mechanic.payment.collected", { requestId: input.requestId, mechanicId: mechanicRow.id, amount: input.amount });

    return NextResponse.json({ payment: data }, { status: 201 });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.payment.collect_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to record payment" }, { status: 500 });
  }
}
