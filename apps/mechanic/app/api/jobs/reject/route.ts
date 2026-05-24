import { rejectionSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["mechanic"]);
    const input = rejectionSchema.parse(await request.json());
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

    const { data, error } = await supabase
      .from("service_requests")
      .update({
        assigned_mechanic_id: null,
        status: "submitted",
        cancelled_reason: `Mechanic rejected: ${input.reason}`
      })
      .eq("id", input.requestId)
      .eq("assigned_mechanic_id", mechanicRow.id)
      .select("id, status, updated_at")
      .single();

    if (error) throw error;

    await supabase.from("mechanics").update({ status: "online" }).eq("id", mechanicRow.id);
    logEvent("warn", "mechanic.job.rejected", { requestId: input.requestId, mechanicId: mechanicRow.id });

    return NextResponse.json({ request: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.job.reject_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to reject job" }, { status: 500 });
  }
}
