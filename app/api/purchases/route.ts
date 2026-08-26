import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (startDate || endDate) {
    where.purchaseDate = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchase.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { supplierId, invoiceNumber, purchaseDate, notes, items, paidAmount } = body;

  if (!supplierId || !items || items.length === 0) {
    return NextResponse.json(
      { error: "Supplier and at least one item are required." },
      { status: 400 }
    );
  }

  const organizationId = "default";

  const total = items.reduce(
    (sum: number, item: { unitCost: number; quantity: number; discount?: number; tax?: number }) =>
      sum + item.unitCost * item.quantity - (item.discount || 0) + (item.tax || 0),
    0
  );

  const paid = paidAmount || 0;
  const dueAmount = total - paid;

  let paymentStatus = "unpaid";
  if (dueAmount <= 0) paymentStatus = "paid";
  else if (paid > 0) paymentStatus = "partial";

  const count = await prisma.purchase.count();
  const year = new Date().getFullYear();
  const purchaseNumber = `PUR-${year}-${String(count + 1).padStart(4, "0")}`;

  const purchase = await prisma.$transaction(async (tx) => {
    const newPurchase = await tx.purchase.create({
      data: {
        organizationId,
        supplierId,
        purchaseNumber,
        invoiceNumber: invoiceNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        subtotal: total,
        total,
        paidAmount: paid,
        dueAmount,
        paymentStatus,
        status: "draft",
        notes: notes || null,
      },
    });

    for (const item of items) {
      const itemTotal =
        item.unitCost * item.quantity - (item.discount || 0) + (item.tax || 0);

      await tx.purchaseItem.create({
        data: {
          purchaseId: newPurchase.id,
          variantId: item.variantId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: itemTotal,
        },
      });

      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      const newStock = (variant?.currentStock || 0) + item.quantity;

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { currentStock: newStock },
      });

      await tx.stockMovement.create({
        data: {
          organizationId,
          variantId: item.variantId,
          movementType: MOVEMENT_TYPES.PURCHASE,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.unitCost * item.quantity,
          balanceAfter: newStock,
          referenceType: "Purchase",
          referenceId: newPurchase.id,
        },
      });
    }

    return newPurchase;
  });

  return NextResponse.json(purchase, { status: 201 });
}
