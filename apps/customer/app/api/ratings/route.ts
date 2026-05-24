import { ratingSchema } from "@mechconnect/core";
import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["customer"]);
    const input = ratingSchema.parse(await request.json());
    const supabase = getServiceSupabase();

    const { data: serviceRequest, error: requestError } = await supabase
      .from("service_requests")
      .select("id, customer_id, assigned_mechanic_id, garage_id, status")
      .eq("id", input.requestId)
      .eq("customer_id", auth.userId)
      .single();

    if (requestError || !serviceRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (serviceRequest.status !== "completed") {
      return NextResponse.json({ error: "Only completed services can be rated" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("ratings")
      .insert({
        request_id: input.requestId,
        customer_id: auth.userId,
        mechanic_id: serviceRequest.assigned_mechanic_id,
        garage_id: serviceRequest.garage_id,
        rating: input.rating,
        review: input.review
      })
      .select("id, rating, review, created_at")
      .single();

    if (error) throw error;

    logEvent("info", "customer.rating.created", { requestId: input.requestId, customerId: auth.userId });
    return NextResponse.json({ rating: data }, { status: 201 });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "customer.rating.create_failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to submit rating" }, { status: 500 });
  }
}
