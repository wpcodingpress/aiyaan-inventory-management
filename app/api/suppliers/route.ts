import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          purchases: {
            select: { total: true, paymentStatus: true },
          },
        },
      }),
      prisma.supplier.count({ where }),
    ]);

    const mapped = suppliers.map((s) => {
      const totalPurchases = s.purchases.length;
      const totalSpent = s.purchases.reduce((sum, p) => sum + Number(p.total), 0);
      const outstanding = s.purchases
        .filter((p) => p.paymentStatus === "unpaid" || p.paymentStatus === "partial")
        .reduce((sum, p) => sum + Number(p.total), 0);

      return {
        id: s.id,
        name: s.name,
        contact: s.contactPerson,
        email: s.email,
        phone: s.phone,
        totalPurchases,
        totalSpent,
        outstanding,
        rating: Number(s.rating),
        status: s.isActive ? "Active" : "Inactive",
      };
    });

    return NextResponse.json({
      suppliers: mapped,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactPerson, email, phone, address } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const org = await prisma.organization.findFirst();
    const organizationId = org?.id ?? "default-org";

    const supplier = await prisma.supplier.create({
      data: {
        name,
        slug,
        organizationId,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Suppliers POST error:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
