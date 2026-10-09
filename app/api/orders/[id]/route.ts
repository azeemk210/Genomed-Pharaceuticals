import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderByNumber(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load order";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
