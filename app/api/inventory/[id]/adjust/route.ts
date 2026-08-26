import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { quantity, reason } = body;

  if (quantity === undefined || quantity === 0) {
    return NextResponse.json({ error: "Quantity is required and cannot be 0" }, { status: 400 });
  }

  const variant = await prisma.productVariant.findUnique({ where: { id } });
  if (!variant) {
    return NextResponse.json({ error: "Variant not found" }, { status: 404 });
  }

  const newStock = (variant.currentStock || 0) + Number(quantity);
  if (newStock < 0) {
    return NextResponse.json({ error: "Stock cannot go below 0" }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id },
      data: { currentStock: newStock },
    }),
    prisma.stockMovement.create({
      data: {
        organizationId: (await prisma.organization.findFirst())?.id || "default",
        variantId: id,
        movementType: Number(quantity) > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
        quantity: Math.abs(Number(quantity)),
        unitCost: variant.purchaseCost || 0,
        totalCost: Math.abs(Number(quantity)) * Number(variant.purchaseCost || 0),
        balanceAfter: newStock,
        referenceType: "Adjustment",
        note: reason || null,
      },
    }),
  ]);

  return NextResponse.json({ variant: updated, newStock });
}
