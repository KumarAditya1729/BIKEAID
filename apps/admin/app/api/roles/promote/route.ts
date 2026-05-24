import { rolePromotionSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["admin", "super_admin"]);
    const input = rolePromotionSchema.parse(await request.json());

    if (input.role === "admin" && auth.profile.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can promote admins" }, { status: 403 });
    }

    const supabase = getServiceSupabase();
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ role: input.role })
      .eq("id", input.profileId)
      .select("id, role, full_name, email")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
      throw error;
    }

    if (input.role === "mechanic") {
      await supabase.from("mechanics").upsert({
        profile_id: input.profileId,
        status: "offline",
        is_verified: false
      }, { onConflict: "profile_id" });
    }

    await supabase.from("audit_logs").insert({
      actor_id: auth.userId,
      action: "ROLE_PROMOTION",
      entity_table: "profiles",
      entity_id: input.profileId,
      after_data: { role: input.role, reason: input.reason }
    });

    logEvent("warn", "admin.role.promoted", { profileId: input.profileId, role: input.role, adminId: auth.userId });
    return NextResponse.json({ profile });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.role.promote_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to promote role" }, { status: 500 });
  }
}
