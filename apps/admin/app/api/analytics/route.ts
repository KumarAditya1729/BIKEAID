import { isResponseError, requireAuth } from "@mechconnect/supabase/auth";
import { logEvent, toErrorMessage } from "@mechconnect/supabase/logging";
import { getServiceSupabase } from "@mechconnect/supabase/server";
import { NextResponse } from "next/server";

type PaymentRow = { status: string; amount: number };
type RequestRow = { status: string; created_at: string };

export async function GET(request: Request) {
  try {
    await requireAuth(request, ["admin", "super_admin"]);
    const supabase = getServiceSupabase();

    const [requestsResult, paymentsResult, mechanicsResult, garagesResult, disputesResult, fraudResult] = await Promise.all([
      supabase.from("service_requests").select("status, created_at"),
      supabase.from("payments").select("status, amount"),
      supabase.from("mechanics").select("id", { count: "exact", head: true }),
      supabase.from("garages").select("id", { count: "exact", head: true }),
      supabase.from("disputes").select("id", { count: "exact", head: true }).in("status", ["open", "investigating"]),
      supabase.from("fraud_logs").select("id", { count: "exact", head: true }).eq("severity", "high")
    ]);

    for (const result of [requestsResult, paymentsResult, mechanicsResult, garagesResult, disputesResult, fraudResult]) {
      if (result.error) throw result.error;
    }

    const requests = (requestsResult.data ?? []) as RequestRow[];
    const payments = (paymentsResult.data ?? []) as PaymentRow[];
    const requestFunnel = requests.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      analytics: {
        totalRequests: requests.length,
        activeRequests: requests.filter((row) => !["completed", "cancelled", "disputed"].includes(row.status)).length,
        completedRequests: requestFunnel.completed ?? 0,
        verifiedRevenue: payments.filter((row) => row.status === "verified").reduce((sum, row) => sum + row.amount, 0),
        pendingPayments: payments.filter((row) => row.status === "pending").length,
        disputedPayments: payments.filter((row) => row.status === "disputed").length,
        mechanics: mechanicsResult.count ?? 0,
        garages: garagesResult.count ?? 0,
        openDisputes: disputesResult.count ?? 0,
        highRiskFraudLogs: fraudResult.count ?? 0,
        requestFunnel
      }
    });
  } catch (error) {
    if (isResponseError(error)) return error;
    logEvent("error", "admin.analytics.failed", { error: toErrorMessage(error) });
    return NextResponse.json({ error: "Unable to load admin analytics" }, { status: 500 });
  }
}
