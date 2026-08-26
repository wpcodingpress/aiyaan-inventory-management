import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json(purchase);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.purchase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.status) {
    data.status = body.status;
  }

  if (body.paidAmount !== undefined) {
    const paid = Number(body.paidAmount);
    const due = Number(existing.total) - paid;
    data.paidAmount = paid;
    data.dueAmount = due;

    if (due <= 0) data.paymentStatus = "paid";
    else if (paid > 0) data.paymentStatus = "partial";
    else data.paymentStatus = "unpaid";
  }

  if (body.notes !== undefined) {
    data.notes = body.notes;
  }

  const purchase = await prisma.purchase.update({
    where: { id },
    data,
    include: {
      supplier: true,
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  return NextResponse.json(purchase);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const updated = await prisma.purchase.update({
    where: { id },
    data: { status: "cancelled" },
    include: {
      supplier: true,
      items: { include: { variant: { include: { product: true } } } },
    },
  });

  return NextResponse.json({
    message: "Purchase cancelled successfully",
    purchase: updated,
  });
}
