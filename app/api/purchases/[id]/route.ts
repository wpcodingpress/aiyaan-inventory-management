import { NextRequest, NextResponse } from "next/server";

const purchases = [
  { id: "1", purchaseNumber: "PO-2024-001", supplier: "Premium Leather Goods Co.", supplierId: "s1", date: "2024-06-15", itemCount: 3, total: 165000, paid: 165000, due: 0, paymentStatus: "Paid", status: "Completed", notes: "Q2 restock order", items: [{ productId: "p1", name: "Classic Oxford Brogue", quantity: 50, unitCost: 2200, discount: 0, tax: 0, total: 110000 }, { productId: "p3", name: "Leather Loafer", quantity: 20, unitCost: 2000, discount: 0, tax: 0, total: 40000 }, { productId: "p5", name: "Minimalist Sneaker", quantity: 10, unitCost: 1500, discount: 0, tax: 0, total: 15000 }] },
  { id: "2", purchaseNumber: "PO-2024-002", supplier: "BD Leather Exports", supplierId: "s2", date: "2024-07-02", itemCount: 2, total: 98000, paid: 50000, due: 48000, paymentStatus: "Partial", status: "Completed", notes: "New collection samples", items: [{ productId: "p2", name: "Suede Chelsea Boot", quantity: 20, unitCost: 2500, discount: 0, tax: 0, total: 50000 }, { productId: "p4", name: "Handstitched Monk Strap", quantity: 17, unitCost: 2800, discount: 6000, tax: 4000, total: 48000 }] },
  { id: "3", purchaseNumber: "PO-2024-003", supplier: "Footwear Manufacturers Ltd.", supplierId: "s3", date: "2024-07-20", itemCount: 4, total: 220000, paid: 0, due: 220000, paymentStatus: "Unpaid", status: "Draft", notes: "", items: [{ productId: "p1", name: "Classic Oxford Brogue", quantity: 40, unitCost: 2200, discount: 0, tax: 0, total: 88000 }, { productId: "p2", name: "Suede Chelsea Boot", quantity: 15, unitCost: 2500, discount: 0, tax: 0, total: 37500 }, { productId: "p3", name: "Leather Loafer", quantity: 30, unitCost: 2000, discount: 0, tax: 0, total: 60000 }, { productId: "p5", name: "Minimalist Sneaker", quantity: 25, unitCost: 1500, discount: 0, tax: 0, total: 37500 }] },
];

function findPurchase(id: string) {
  return purchases.findIndex((p) => p.id === id);
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = findPurchase(id);
  if (index === -1) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }
  return NextResponse.json(purchases[index]);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = findPurchase(id);
  if (index === -1) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const body = await request.json();
  const purchase = purchases[index];

  if (body.status) {
    purchase.status = body.status;
  }

  if (body.paidAmount !== undefined) {
    purchase.paid = body.paidAmount;
    purchase.due = purchase.total - body.paidAmount;

    if (purchase.due <= 0) purchase.paymentStatus = "Paid";
    else if (purchase.paid > 0) purchase.paymentStatus = "Partial";
    else purchase.paymentStatus = "Unpaid";
  }

  if (body.notes !== undefined) {
    purchase.notes = body.notes;
  }

  return NextResponse.json(purchase);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = findPurchase(id);
  if (index === -1) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  purchases[index].status = "Cancelled";
  return NextResponse.json({ message: "Purchase cancelled successfully", purchase: purchases[index] });
}
