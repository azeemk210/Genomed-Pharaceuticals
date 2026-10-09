import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { updateOrder } from "@/lib/orders";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateOrder(id, {
      status: body.status,
      payment_status: body.payment_status,
      delhivery_awb: body.delhivery_awb,
      tracking_url: body.tracking_url,
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
