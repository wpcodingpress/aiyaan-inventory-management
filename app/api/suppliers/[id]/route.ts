import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            purchaseNumber: true,
            purchaseDate: true,
            total: true,
            paymentStatus: true,
            status: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Supplier GET error:", error);
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, contactPerson, email, phone, address, rating, isActive } = body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactPerson && { contactPerson }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(rating !== undefined && { rating }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Supplier PUT error:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Supplier archived" });
  } catch (error) {
    console.error("Supplier DELETE error:", error);
    return NextResponse.json({ error: "Failed to archive supplier" }, { status: 500 });
  }
}
