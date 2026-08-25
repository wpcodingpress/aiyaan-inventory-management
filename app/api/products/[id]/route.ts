import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, sku, description, categoryId, brandId, status } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(sku && { sku }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(status && { status }),
      },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { status: "archived" },
    });

    return NextResponse.json({ message: "Product archived" });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to archive product" },
      { status: 500 }
    );
  }
}
