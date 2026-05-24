import { mechanicAvailabilitySchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request, ["mechanic"]);
    const input = mechanicAvailabilitySchema.parse(await request.json());

    const { data, error } = await getServiceSupabase()
      .from("mechanics")
      .update({ status: input.status })
      .eq("profile_id", auth.userId)
      .select("id, status, updated_at")
      .single();

    if (error) throw error;

    logEvent("info", "mechanic.availability.updated", { mechanicProfileId: auth.userId, status: input.status });
    return NextResponse.json({ mechanic: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.availability.update_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to update availability" }, { status: 500 });
  }
}
