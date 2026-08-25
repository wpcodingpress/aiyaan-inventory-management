import { NextRequest, NextResponse } from "next/server";

const purchases = [
  { id: "1", purchaseNumber: "PO-2024-001", supplier: "Premium Leather Goods Co.", supplierId: "s1", date: "2024-06-15", itemCount: 3, total: 165000, paid: 165000, due: 0, paymentStatus: "Paid", status: "Completed" },
  { id: "2", purchaseNumber: "PO-2024-002", supplier: "BD Leather Exports", supplierId: "s2", date: "2024-07-02", itemCount: 2, total: 98000, paid: 50000, due: 48000, paymentStatus: "Partial", status: "Completed" },
  { id: "3", purchaseNumber: "PO-2024-003", supplier: "Footwear Manufacturers Ltd.", supplierId: "s3", date: "2024-07-20", itemCount: 4, total: 220000, paid: 0, due: 220000, paymentStatus: "Unpaid", status: "Draft" },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");

  let results = purchases;
  if (status) {
    results = results.filter((p) => p.status === status);
  }

  const start = (page - 1) * limit;
  const paginatedItems = results.slice(start, start + limit);

  return NextResponse.json({
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total: results.length,
      totalPages: Math.ceil(results.length / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { supplierId, supplier, invoiceNumber, date, items, notes, paidAmount } = body;

  if (!supplierId || !items || items.length === 0) {
    return NextResponse.json({ error: "Supplier and at least one item are required." }, { status: 400 });
  }

  const total = items.reduce(
    (sum: number, item: { unitCost: number; quantity: number; discount: number; tax: number }) =>
      sum + item.unitCost * item.quantity - item.discount + item.tax,
    0
  );

  const dueAmount = total - (paidAmount || 0);

  let paymentStatus = "Unpaid";
  if (dueAmount <= 0) paymentStatus = "Paid";
  else if (paidAmount > 0) paymentStatus = "Partial";

  const newPurchase = {
    id: String(purchases.length + 1),
    purchaseNumber: `PO-2024-${String(purchases.length + 1).padStart(3, "0")}`,
    supplierId,
    supplier,
    invoiceNumber,
    date: date || new Date().toISOString().split("T")[0],
    itemCount: items.length,
    total,
    paid: paidAmount || 0,
    due: dueAmount,
    paymentStatus,
    status: "Draft",
    notes,
    items,
  };

  purchases.push(newPurchase);

  return NextResponse.json(newPurchase, { status: 201 });
}
