import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          saleNumber: true,
          saleDate: true,
          total: true,
          paidAmount: true,
          dueAmount: true,
          paymentStatus: true,
          status: true,
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  return NextResponse.json(customer);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.state !== undefined && { state: body.state }),
      ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
      ...(body.country !== undefined && { country: body.country }),
      ...(body.customerType !== undefined && { customerType: body.customerType }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await prisma.customer.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Customer deactivated successfully" });
}
