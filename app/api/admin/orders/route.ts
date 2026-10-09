import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listOrders } from "@/lib/orders";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const orders = await listOrders({ status, search });
    return NextResponse.json({ orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to list orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
