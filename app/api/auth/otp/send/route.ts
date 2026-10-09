import { NextResponse } from "next/server";
import { sendOtp } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const result = await sendOtp(phone);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
