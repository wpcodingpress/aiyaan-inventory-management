import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOVEMENT_TYPES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const paymentStatus = searchParams.get("paymentStatus");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: Record<string, unknown> = {};
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (dateFrom || dateTo) {
    where.saleDate = {};
    if (dateFrom) (where.saleDate as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.saleDate as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59.000Z");
  }

  const [items, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, customerType: true } },
        items: { select: { id: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  const formatted = items.map((sale) => ({
    ...sale,
    customerName: sale.customer?.name || "Walk-in",
    customerType: sale.customer?.customerType || "",
    itemCount: sale.items.length,
  }));

  return NextResponse.json({
    items: formatted,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, paidAmount, notes } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required." }, { status: 400 });
    }

    const variantIds = items.map((item: { variantId: string }) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 400 });
      }
      if (variant.currentStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant.sku}. Available: ${variant.currentStock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: { sellingPrice: number; quantity: number }) => sum + item.sellingPrice * item.quantity,
      0
    );
    const totalDiscount = items.reduce(
      (sum: number, item: { discount: number }) => sum + (item.discount || 0),
      0
    );
    const totalTax = items.reduce(
      (sum: number, item: { tax: number }) => sum + (item.tax || 0),
      0
    );
    const total = subtotal - totalDiscount + totalTax;
    const dueAmount = total - (paidAmount || 0);

    let paymentStatus = "unpaid";
    if (dueAmount <= 0) paymentStatus = "paid";
    else if (paidAmount > 0) paymentStatus = "partial";

    const saleCount = await prisma.sale.count();

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          organizationId: "default",
          customerId: customerId || null,
          saleNumber: `SO-${new Date().getFullYear()}-${String(saleCount + 1).padStart(3, "0")}`,
          saleDate: new Date(),
          subtotal,
          discount: totalDiscount,
          tax: totalTax,
          total,
          paidAmount: paidAmount || 0,
          dueAmount: Math.max(0, dueAmount),
          paymentStatus,
          status: "completed",
          notes: notes || null,
        },
      });

      for (const item of items) {
        const variant = variantMap.get(item.variantId)!;
        const costAtSale = variant.purchaseCost;
        const profit = (item.sellingPrice - costAtSale.toNumber()) * item.quantity;

        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: variant.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            costAtSale,
            discount: item.discount || 0,
            tax: item.tax || 0,
            total: item.sellingPrice * item.quantity - (item.discount || 0) + (item.tax || 0),
            profit,
          },
        });

        const newStock = variant.currentStock - item.quantity;
        await tx.stockMovement.create({
          data: {
            organizationId: "default",
            variantId: item.variantId,
            movementType: MOVEMENT_TYPES.SALE,
            quantity: -item.quantity,
            unitCost: costAtSale,
            totalCost: costAtSale.toNumber() * item.quantity,
            balanceAfter: newStock,
            referenceType: "sale",
            referenceId: newSale.id,
            note: `Sale ${newSale.saleNumber}`,
          },
        });

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { currentStock: newStock },
        });
      }

      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSales: { increment: 1 },
            totalSpent: { increment: total },
            outstandingBalance: { increment: dueAmount > 0 ? dueAmount : 0 },
          },
        });
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json({ error: "Failed to create sale." }, { status: 500 });
  }
}
