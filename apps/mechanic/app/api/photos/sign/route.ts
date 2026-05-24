import { photoMetadataSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["mechanic"]);
    const input = photoMetadataSchema.parse(await request.json());
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

    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select("id")
      .eq("id", input.requestId)
      .eq("assigned_mechanic_id", mechanicRow.id)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json({ error: "Assigned request not found" }, { status: 404 });
    }

    const extension = input.contentType === "image/png" ? "png" : input.contentType === "image/webp" ? "webp" : "jpg";
    const path = `${input.requestId}/${input.phase}-${Date.now()}.${extension}`;
    const { data: signedUpload, error: signedError } = await supabase.storage
      .from("service-photos")
      .createSignedUploadUrl(path);

    if (signedError) throw signedError;

    const { error: metadataError } = await supabase.from("service_photos").insert({
      request_id: input.requestId,
      mechanic_id: mechanicRow.id,
      phase: input.phase,
      storage_path: path,
      content_type: input.contentType
    });

    if (metadataError) throw metadataError;

    logEvent("info", "mechanic.photo.signed", { requestId: input.requestId, mechanicId: mechanicRow.id, phase: input.phase });
    return NextResponse.json({ path, signedUpload });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "mechanic.photo.sign_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to prepare photo upload" }, { status: 500 });
  }
}
