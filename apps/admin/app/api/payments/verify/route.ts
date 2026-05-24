import { paymentCollectionSchema } from "@mechconnect/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const parsed = paymentCollectionSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment verification payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    accepted: true,
    nextStep: "Wire this handler to Supabase using a server session, assert admin role from profiles, then update payments.status to verified."
  });
}
