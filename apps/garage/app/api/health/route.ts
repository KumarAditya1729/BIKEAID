import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, app: "garage", at: new Date().toISOString() });
}
