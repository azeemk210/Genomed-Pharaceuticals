import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getStockList, updateStockQty } from "@/lib/orders";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stock = await getStockList();
    return NextResponse.json({ stock });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { slug, qty } = body;

    if (!slug || qty === undefined) {
      return NextResponse.json({ error: "Product slug and quantity are required" }, { status: 400 });
    }

    await updateStockQty(slug, Number(qty));
    return NextResponse.json({ success: true, slug, qty: Number(qty) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
