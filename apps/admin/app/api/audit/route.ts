import { auditLogQuerySchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth(request, ["admin", "super_admin"]);
    const search = Object.fromEntries(new URL(request.url).searchParams);
    const input = auditLogQuerySchema.parse(search);

    let query = getServiceSupabase()
      .from("audit_logs")
      .select("id, actor_id, action, entity_table, entity_id, before_data, after_data, ip_address, created_at")
      .order("created_at", { ascending: false })
      .limit(input.limit);

    if (input.entityTable) query = query.eq("entity_table", input.entityTable);
    if (input.entityId) query = query.eq("entity_id", input.entityId);
    if (input.action) query = query.eq("action", input.action);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ auditLogs: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.audit.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load audit logs" }, { status: 500 });
  }
}
