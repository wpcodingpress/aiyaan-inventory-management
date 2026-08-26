import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  // Get org
  const org = await prisma.organization.findFirst();
  const organizationId = org?.id || "default";

  // Build where clause for variants
  const where: any = {
    product: { organizationId, status: "active" },
  };

  if (search) {
    where.OR = [
      { sku: { contains: search } },
      { product: { name: { contains: search } } },
    ];
  }

  const variants = await prisma.productVariant.findMany({
    where,
    include: {
      product: {
        select: { name: true, id: true },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.productVariant.count({ where });

  // Map to inventory items
  const items = variants.map((v) => {
    const stock = v.currentStock || 0;
    const min = v.minimumStock || 0;
    let status = "In Stock";
    if (stock === 0) status = "Out of Stock";
    else if (min > 0 && stock <= min) status = "Low Stock";

    return {
      id: v.id,
      productId: v.product.id,
      product: v.product.name,
      variant: [v.size, v.color, v.material].filter(Boolean).join(" / ") || "Default",
      sku: v.sku,
      currentStock: stock,
      minLevel: min,
      purchaseCost: Number(v.purchaseCost || 0),
      retailPrice: Number(v.sellingPrice || 0),
      value: stock * Number(v.purchaseCost || 0),
      status,
    };
  });

  // Stats
  const allVariants = await prisma.productVariant.findMany({
    where: { product: { organizationId, status: "active" } },
    select: { currentStock: true, purchaseCost: true, sellingPrice: true, minimumStock: true },
  });

  const stats = {
    totalUnits: allVariants.reduce((s, v) => s + (v.currentStock || 0), 0),
    inventoryCost: allVariants.reduce((s, v) => s + (v.currentStock || 0) * Number(v.purchaseCost || 0), 0),
    retailValue: allVariants.reduce((s, v) => s + (v.currentStock || 0) * Number(v.sellingPrice || 0), 0),
    lowStockCount: allVariants.filter((v) => (v.currentStock || 0) > 0 && (v.minimumStock || 0) > 0 && (v.currentStock || 0) <= (v.minimumStock || 0)).length,
    outOfStockCount: allVariants.filter((v) => (v.currentStock || 0) === 0).length,
    productCount: allVariants.length,
  };

  return NextResponse.json({
    items,
    stats,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
