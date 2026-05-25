import { profileUpdateSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);

    return NextResponse.json({
      profile: {
        id: auth.profile.id,
        role: auth.profile.role,
        fullName: auth.profile.full_name,
        phone: auth.profile.phone,
        email: auth.profile.email,
        isActive: auth.profile.is_active
      }
    });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.profile.load_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load profile" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request, ["customer", "mechanic", "garage_owner", "admin", "super_admin"]);
    const input = profileUpdateSchema.parse(await request.json());

    const update: Record<string, string> = {};
    if (input.fullName !== undefined) update.full_name = input.fullName;
    if (input.phone !== undefined) update.phone = input.phone;

    const { data, error } = await getServiceSupabase()
      .from("profiles")
      .update(update)
      .eq("id", auth.userId)
      .select("id, role, full_name, phone, email, is_active, updated_at")
      .single();

    if (error) throw error;

    logEvent("info", "profile.updated", { userId: auth.userId });
    return NextResponse.json({ profile: data });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.profile.update_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
