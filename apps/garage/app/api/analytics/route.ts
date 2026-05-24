import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

type GarageRow = { id: string };
type ServiceRequestRow = { id: string; status: string; garage_id: string | null; estimated_total: number; created_at: string };
type PaymentRow = { status: string; amount: number };

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

    let requestsQuery = supabase
      .from("service_requests")
      .select("id, status, garage_id, estimated_total, created_at");

    if (garageIds) {
      if (garageIds.length === 0) {
        return NextResponse.json({ analytics: { activeJobs: 0, completedJobs: 0, verifiedRevenue: 0, pendingPayments: 0 } });
      }
      requestsQuery = requestsQuery.in("garage_id", garageIds);
    }

    const { data: requests, error: requestsError } = await requestsQuery;
    if (requestsError) throw requestsError;

    const requestRows = requests as ServiceRequestRow[];
    const requestIds = requestRows.map((serviceRequest) => serviceRequest.id);
    let payments: PaymentRow[] = [];

    if (requestIds.length > 0) {
      const { data: paymentRows, error: paymentsError } = await supabase
        .from("payments")
        .select("status, amount")
        .in("request_id", requestIds);

      if (paymentsError) throw paymentsError;
      payments = paymentRows as PaymentRow[];
    }

    const analytics = {
      activeJobs: requestRows.filter((serviceRequest) => !["completed", "cancelled", "disputed"].includes(serviceRequest.status)).length,
      completedJobs: requestRows.filter((serviceRequest) => serviceRequest.status === "completed").length,
      verifiedRevenue: payments.filter((payment) => payment.status === "verified").reduce((sum, payment) => sum + payment.amount, 0),
      pendingPayments: payments.filter((payment) => payment.status === "pending").length
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "garage.analytics.failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load analytics" }, { status: 500 });
  }
}
