import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          product: { select: { name: true, sku: true } },
          variant: { select: { sku: true, size: true, color: true } },
        },
      },
    },
  });

  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  return NextResponse.json(sale);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) {
    return NextResponse.json({ error: "Sale not found" }, { status: 404 });
  }

  if (body.status === "cancelled" && sale.status !== "cancelled") {
    await prisma.$transaction(async (tx) => {
      for (const item of sale.items) {
        await tx.productVariant.update({
          where: { id: item.variantId! },
          data: { currentStock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            organizationId: sale.organizationId,
            variantId: item.variantId!,
            movementType: "SALE_RETURN",
            quantity: item.quantity,
            unitCost: item.costAtSale,
            totalCost: item.costAtSale.toNumber() * item.quantity,
            balanceAfter: 0,
            referenceType: "sale",
            referenceId: sale.id,
            note: `Sale cancelled: ${sale.saleNumber}`,
          },
        });
      }

      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            totalSales: { decrement: 1 },
            totalSpent: { decrement: sale.total },
            outstandingBalance: { decrement: sale.dueAmount },
          },
        });
      }

      await tx.sale.update({
        where: { id },
        data: { status: "cancelled" },
      });
    });
  } else {
    await prisma.sale.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
  }

  const updated = await prisma.sale.findUnique({ where: { id }, include: { customer: true, items: true } });
  return NextResponse.json(updated);
}
