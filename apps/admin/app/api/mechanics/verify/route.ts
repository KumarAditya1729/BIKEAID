import { mechanicVerificationSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request, ["admin", "super_admin"]);
    const input = mechanicVerificationSchema.parse(await request.json());

    const update: Record<string, string | number | boolean> = {
      is_verified: input.isVerified
    };

    if (input.garageId) update.garage_id = input.garageId;
    if (input.payoutPercentage !== undefined) update.payout_percentage = input.payoutPercentage;

    const { data, error } = await getServiceSupabase()
      .from("mechanics")
      .update(update)
      .eq("id", input.mechanicId)
      .select("id, garage_id, is_verified, payout_percentage, updated_at")
      .single();

    if (error) throw error;

    logEvent("info", "admin.mechanic.verification_updated", { mechanicId: input.mechanicId, adminId: auth.userId, verified: input.isVerified });
    return NextResponse.json({ mechanic: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.mechanic.verify_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to update mechanic verification" }, { status: 500 });
  }
}
