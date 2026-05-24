import { paymentVerificationSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { checkRateLimit, getClientIp } from "@mechconnect/supabase/rate-limit";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`payment:verify:${ip}`, 40, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many payment verification attempts" }, { status: 429, headers: { "retry-after": String(rate.retryAfterSeconds) } });
    }

    const auth = await requireAuth(request, ["admin", "super_admin"]);
    const input = paymentVerificationSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        status: input.status,
        verified_by: auth.userId,
        verified_at: new Date().toISOString(),
        reference_note: input.referenceNote
      })
      .eq("request_id", input.requestId)
      .select("id, request_id, status, amount, verified_at")
      .single();

    if (error) throw error;

    await supabase
      .from("service_requests")
      .update({ status: input.status === "verified" ? "completed" : "disputed" })
      .eq("id", input.requestId);

    if (input.status === "disputed") {
      await supabase.from("fraud_logs").insert({
        actor_id: auth.userId,
        request_id: input.requestId,
        event_type: "payment_disputed_by_admin",
        severity: "medium",
        metadata: { paymentId: payment.id }
      });
    }

    logEvent("info", "admin.payment.reviewed", { requestId: input.requestId, status: input.status, adminId: auth.userId });
    return NextResponse.json({ payment });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.payment.verify_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to verify payment" }, { status: 500 });
  }
}
