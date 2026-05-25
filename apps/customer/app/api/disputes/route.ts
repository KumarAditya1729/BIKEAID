import { disputeCreateSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["customer"]);
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("disputes")
      .select("id, request_id, status, reason, resolution, created_at, resolved_at")
      .eq("opened_by", auth.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ disputes: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.disputes.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load disputes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["customer"]);
    const input = disputeCreateSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select("id, customer_id, status")
      .eq("id", input.requestId)
      .eq("customer_id", auth.userId)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("disputes")
      .insert({
        request_id: input.requestId,
        opened_by: auth.userId,
        reason: input.reason,
        status: "open"
      })
      .select("id, request_id, status, reason, created_at")
      .single();

    if (error) throw error;

    const serviceRequestRow = serviceRequest as { status: string };
    if (!["completed", "cancelled", "disputed"].includes(serviceRequestRow.status)) {
      await supabase.from("service_requests").update({ status: "disputed" }).eq("id", input.requestId);
    }
    await supabase.from("fraud_logs").insert({
      actor_id: auth.userId,
      request_id: input.requestId,
      event_type: "customer_dispute_opened",
      severity: "medium",
      metadata: { disputeId: data.id }
    });

    logEvent("warn", "customer.dispute.opened", { requestId: input.requestId, customerId: auth.userId });
    return NextResponse.json({ dispute: data }, { status: 201 });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.dispute.create_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to open dispute" }, { status: 500 });
  }
}
