import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { listOrders, generateCourierCsv } from "@/lib/orders";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await listOrders({ limit: 1000 });
    const csvContent = generateCourierCsv(orders);

    const filename = `genomed-orders-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to export orders CSV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
