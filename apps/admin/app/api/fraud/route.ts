import { fraudLogQuerySchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth(request, ["admin", "super_admin"]);
    const search = Object.fromEntries(new URL(request.url).searchParams);
    const input = fraudLogQuerySchema.parse(search);

    let query = getServiceSupabase()
      .from("fraud_logs")
      .select("id, actor_id, request_id, event_type, severity, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(input.limit);

    if (input.severity) query = query.eq("severity", input.severity);
    if (input.eventType) query = query.eq("event_type", input.eventType);
    if (input.requestId) query = query.eq("request_id", input.requestId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ fraudLogs: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.fraud.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load fraud logs" }, { status: 500 });
  }
}
