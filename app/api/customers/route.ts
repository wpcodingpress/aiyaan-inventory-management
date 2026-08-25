import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, city, state, postalCode, country, customerType, notes } = body;

    if (!name) {
      return NextResponse.json({ error: "Customer name is required." }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId: "default",
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        customerType: customerType || "individual",
        notes: notes || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Failed to create customer." }, { status: 500 });
  }
}
