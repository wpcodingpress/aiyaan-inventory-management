import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const movements = await prisma.stockMovement.findMany({
    where: { variantId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const history = movements.map((m) => ({
    id: m.id,
    date: m.createdAt.toISOString().split("T")[0],
    type: m.movementType,
    quantity: m.quantity,
    reference: m.referenceType + (m.referenceId ? ` #${m.referenceId.slice(0, 8)}` : ""),
    note: m.note,
    balanceAfter: m.balanceAfter,
  }));

  return NextResponse.json({ history });
}
