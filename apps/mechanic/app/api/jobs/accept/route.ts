import { completionOtpSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["mechanic"]);
    const input = completionOtpSchema.pick({ requestId: true }).parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: mechanic, error: mechanicError } = await supabase
      .from("mechanics")
      .select("id")
      .eq("profile_id", auth.userId)
      .eq("is_verified", true)
      .single();

    if (mechanicError || !mechanic) {
      return NextResponse.json({ error: "Verified mechanic profile not found" }, { status: 403 });
    }
    const mechanicRow = mechanic as { id: string };

    const { data, error } = await supabase
      .from("service_requests")
      .update({ status: "accepted" })
      .eq("id", input.requestId)
      .eq("assigned_mechanic_id", mechanicRow.id)
      .in("status", ["assigned", "submitted"])
      .select("id, status, updated_at")
      .single();

    if (error) throw error;

    await supabase.from("mechanics").update({ status: "busy" }).eq("id", mechanicRow.id);
    logEvent("info", "mechanic.job.accepted", { requestId: input.requestId, mechanicId: mechanicRow.id });

    return NextResponse.json({ request: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.job.accept_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to accept job" }, { status: 500 });
  }
}
