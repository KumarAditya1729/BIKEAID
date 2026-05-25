import { disputeUpdateSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth(request, ["admin", "super_admin"]);
    const limit = Math.min(Number(new URL(request.url).searchParams.get("limit") ?? 50), 100);

    const { data, error } = await getServiceSupabase()
      .from("disputes")
      .select("id, request_id, opened_by, status, reason, resolution, created_at, resolved_at, profiles:opened_by(full_name, phone, email)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ disputes: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.disputes.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load disputes" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request, ["admin", "super_admin"]);
    const input = disputeUpdateSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const update = {
      status: input.status,
      resolution: input.resolution,
      resolved_at: ["resolved", "rejected"].includes(input.status) ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from("disputes")
      .update(update)
      .eq("id", input.disputeId)
      .select("id, request_id, status, reason, resolution, resolved_at")
      .single();

    if (error) throw error;
    const disputeRow = data as { request_id: string };

    if (["resolved", "rejected"].includes(input.status)) {
      const { data: serviceRequest } = await supabase
        .from("service_requests")
        .select("status")
        .eq("id", disputeRow.request_id)
        .single();

      const serviceRequestRow = serviceRequest as { status?: string } | null;
      if (["disputed", "payment_pending_verification"].includes(serviceRequestRow?.status ?? "")) {
        await supabase
        .from("service_requests")
          .update({ status: "completed" })
          .eq("id", disputeRow.request_id);
      }
    }

    await supabase.from("audit_logs").insert({
      actor_id: auth.userId,
      action: "DISPUTE_REVIEW",
      entity_table: "disputes",
      entity_id: input.disputeId,
      after_data: { status: input.status, resolution: input.resolution }
    });

    logEvent("warn", "admin.dispute.reviewed", { disputeId: input.disputeId, status: input.status, adminId: auth.userId });
    return NextResponse.json({ dispute: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.dispute.update_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to update dispute" }, { status: 500 });
  }
}
