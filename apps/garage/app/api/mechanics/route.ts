import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

type GarageRow = { id: string };

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["garage_owner", "admin", "super_admin"]);
    const supabase = getServiceSupabase();

    let garageIds: string[] | null = null;

    if (auth.profile.role === "garage_owner") {
      const { data: garages, error: garageError } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", auth.userId);

      if (garageError) throw garageError;
      garageIds = (garages as GarageRow[]).map((garage) => garage.id);
    }

    let query = supabase
      .from("mechanics")
      .select("id, status, is_verified, payout_percentage, garage_id, profiles:profile_id(full_name, phone, email)")
      .order("updated_at", { ascending: false });

    if (garageIds) {
      if (garageIds.length === 0) return NextResponse.json({ mechanics: [] });
      query = query.in("garage_id", garageIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ mechanics: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "garage.mechanics.list_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load mechanics" }, { status: 500 });
  }
}
