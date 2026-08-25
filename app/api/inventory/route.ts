import { NextRequest, NextResponse } from "next/server";

const inventoryData = [
  { id: "1", product: "Classic Oxford Brogue", productId: "p1", variant: "Tan / 42", sku: "OXF-TAN-42", currentStock: 145, minLevel: 50, purchaseCost: 2200, retailPrice: 3960, status: "In Stock" },
  { id: "2", product: "Suede Chelsea Boot", productId: "p2", variant: "Navy / 44", sku: "CHL-NVY-44", currentStock: 18, minLevel: 25, purchaseCost: 2500, retailPrice: 4500, status: "Low Stock" },
  { id: "3", product: "Leather Loafer", productId: "p3", variant: "Black / 41", sku: "LFR-BLK-41", currentStock: 88, minLevel: 30, purchaseCost: 2000, retailPrice: 3600, status: "In Stock" },
  { id: "4", product: "Handstitched Monk Strap", productId: "p4", variant: "Oxblood / 43", sku: "MNK-OXB-43", currentStock: 0, minLevel: 15, purchaseCost: 2800, retailPrice: 5040, status: "Out of Stock" },
  { id: "5", product: "Minimalist Sneaker", productId: "p5", variant: "White / 42", sku: "SNK-WHT-42", currentStock: 210, minLevel: 100, purchaseCost: 1500, retailPrice: 2700, status: "In Stock" },
];

function computeStatus(item: { currentStock: number; minLevel: number }) {
  if (item.currentStock === 0) return "Out of Stock";
  if (item.currentStock < item.minLevel) return "Low Stock";
  return "In Stock";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "all";

  let items = inventoryData.map((item) => ({
    ...item,
    value: item.currentStock * item.purchaseCost,
    status: computeStatus(item),
  }));

  if (tab === "low-stock") {
    items = items.filter((i) => i.status === "Low Stock");
  } else if (tab === "out-of-stock") {
    items = items.filter((i) => i.status === "Out of Stock");
  }

  const totalUnits = items.reduce((sum, i) => sum + i.currentStock, 0);
  const totalValue = items.reduce((sum, i) => sum + i.value, 0);

  return NextResponse.json({
    items,
    summary: {
      totalItems: items.length,
      totalUnits,
      totalValue,
      lowStock: items.filter((i) => i.status === "Low Stock").length,
      outOfStock: items.filter((i) => i.status === "Out of Stock").length,
    },
  });
}
