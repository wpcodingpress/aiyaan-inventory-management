import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const brand = searchParams.get("brand") ?? "";
    const skip = (page - 1) * limit;

    const org = await prisma.organization.findFirst();
    const organizationId = org?.id ?? "default-org";

    const where: Prisma.ProductWhereInput = {
      organizationId,
      status: "active",
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }
    if (category) {
      where.category = { name: { equals: category } };
    }
    if (brand) {
      where.brand = { name: { equals: brand } };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          brand: { select: { name: true } },
          variants: {
            select: {
              id: true,
              sku: true,
              currentStock: true,
              purchaseCost: true,
              sellingPrice: true,
              minimumStock: true,
              size: true,
              color: true,
              material: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const mappedProducts = products.map((product) => {
      const totalStock = product.variants.reduce(
        (sum, v) => sum + (v.currentStock ?? 0),
        0
      );
      const minStock = product.variants.reduce(
        (sum, v) => sum + (v.minimumStock ?? 0),
        0
      );
      let status = "In Stock";
      if (totalStock === 0) status = "Out of Stock";
      else if (minStock > 0 && totalStock <= minStock) status = "Low Stock";

      const avgCost =
        product.variants.length > 0
          ? product.variants.reduce((sum, v) => sum + Number(v.purchaseCost ?? 0), 0) /
            product.variants.length
          : 0;
      const avgPrice =
        product.variants.length > 0
          ? product.variants.reduce((sum, v) => sum + Number(v.sellingPrice ?? 0), 0) /
            product.variants.length
          : 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category?.name ?? "Uncategorized",
        brand: product.brand?.name ?? "",
        variantCount: product.variants.length,
        cost: avgCost,
        price: avgPrice,
        stock: totalStock,
        status,
        thumbnail: product.image,
      };
    });

    return NextResponse.json({
      products: mappedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sku, description, categoryId, brandId, variants } = body;

    const org = await prisma.organization.findFirst();
    const organizationId = org?.id ?? "default-org";

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        organizationId,
        categoryId: categoryId || null,
        brandId: brandId || null,
        status: "active",
        variants: variants
          ? {
              create: variants.map(
                (v: {
                  sku: string;
                  size?: string;
                  color?: string;
                  material?: string;
                  purchaseCost: number;
                  sellingPrice: number;
                  currentStock?: number;
                  minimumStock?: number;
                }) => ({
                  sku: v.sku,
                  size: v.size || null,
                  color: v.color || null,
                  material: v.material || null,
                  purchaseCost: v.purchaseCost,
                  sellingPrice: v.sellingPrice,
                  currentStock: v.currentStock ?? 0,
                  minimumStock: v.minimumStock ?? 0,
                })
              ),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
