import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const category = searchParams.get("category") ?? "";
    const startDate = searchParams.get("startDate") ?? "";
    const endDate = searchParams.get("endDate") ?? "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Expenses API error:", error);
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, amount, date, paymentMethod, reference, notes } = body;

    const expense = await prisma.expense.create({
      data: {
        organizationId: "default-org",
        category,
        title,
        amount: parseFloat(amount),
        date: new Date(date),
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Expenses POST error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
