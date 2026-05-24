import { assignmentSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["admin", "super_admin"]);
    const input = assignmentSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: mechanic, error: mechanicError } = await supabase
      .from("mechanics")
      .select("id, garage_id, is_verified")
      .eq("id", input.mechanicId)
      .single();

    if (mechanicError || !mechanic || !mechanic.is_verified || mechanic.garage_id !== input.garageId) {
      return NextResponse.json({ error: "Verified mechanic must belong to selected garage" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update({
        garage_id: input.garageId,
        assigned_mechanic_id: input.mechanicId,
        status: "assigned"
      })
      .eq("id", input.requestId)
      .select("id, garage_id, assigned_mechanic_id, status, updated_at")
      .single();

    if (error) throw error;

    await supabase.from("mechanics").update({ status: "busy" }).eq("id", input.mechanicId);
    logEvent("info", "admin.request.assigned", { requestId: input.requestId, adminId: auth.userId });

    return NextResponse.json({ request: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.request.assign_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to assign request" }, { status: 500 });
  }
}
