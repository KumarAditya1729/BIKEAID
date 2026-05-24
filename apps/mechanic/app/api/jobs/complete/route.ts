import { completionOtpSchema } from "@mechconnect/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const parsed = completionOtpSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid OTP completion payload", issues: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    accepted: true,
    nextStep: "Verify the OTP hash in Supabase, mark otp_verified_at, and move the request to completed_pending_payment."
  });
}
