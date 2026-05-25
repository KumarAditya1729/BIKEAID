import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAuth(request, ["admin", "super_admin"]);
    const searchParams = new URL(request.url).searchParams;
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

    let query = getServiceSupabase()
      .from("service_requests")
      .select("id, service_type, bike_category, distance_slab, pickup_address, issue_description, whatsapp_number, status, estimated_total, created_at, updated_at, profiles:customer_id(full_name, phone, email), garages:garage_id(name, city), mechanics:assigned_mechanic_id(id, profiles:profile_id(full_name, phone)), payments(status, amount, method)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.requests.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load service requests" }, { status: 500 });
  }
}
