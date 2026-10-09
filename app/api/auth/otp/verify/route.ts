import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and 6-digit OTP code are required" },
        { status: 400 }
      );
    }

    const result = await verifyOtp(phone, code);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid or expired OTP";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
