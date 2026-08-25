import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const seedApiKey = process.env.SEED_API_KEY;

  if (!seedApiKey || authHeader !== `Bearer ${seedApiKey}`) {
    return NextResponse.json(
      { error: "Unauthorized. Provide a valid SEED_API_KEY in the Authorization header." },
      { status: 401 }
    );
  }

  const seedData = {
    organization: {
      name: "Ayan's Crafts",
      type: "Footwear",
      contactEmail: "info@ayanscrafts.com",
      contactPhone: "+880 1712-345678",
      address: "42/A, Road 11, Dhanmondi, Dhaka 1205, Bangladesh",
      currency: "BDT",
      timezone: "Asia/Dhaka",
      dateFormat: "DD/MM/YYYY",
    },
    categories: [
      { id: "cat1", name: "Sandals", description: "Casual and formal sandals" },
      { id: "cat2", name: "Sneakers", description: "Canvas and athletic sneakers" },
      { id: "cat3", name: "Formal Shoes", description: "Dress and office shoes" },
      { id: "cat4", name: "Sports Shoes", description: "Running and sports footwear" },
      { id: "cat5", name: "Accessories", description: "Belts, laces, insoles, and more" },
    ],
    products: [
      { id: "p1", name: "Classic Leather Sandal", sku: "SND-LTH-001", categoryId: "cat1", price: 900, cost: 450, stock: 320 },
      { id: "p2", name: "Urban Canvas Sneaker", sku: "SNK-CVS-001", categoryId: "cat2", price: 1200, cost: 650, stock: 180 },
      { id: "p3", name: "Executive Formal Shoe", sku: "FRM-EXC-001", categoryId: "cat3", price: 2400, cost: 1200, stock: 95 },
      { id: "p4", name: "Sport Pro Runner", sku: "SPT-RNR-001", categoryId: "cat4", price: 1600, cost: 850, stock: 140 },
      { id: "p5", name: "Leather Belt Premium", sku: "ACC-BLT-001", categoryId: "cat5", price: 400, cost: 180, stock: 450 },
      { id: "p6", name: "Canvas Slip-On", sku: "SNK-SLP-001", categoryId: "cat2", price: 800, cost: 440, stock: 95 },
      { id: "p7", name: "Sport Pro Runner Women", sku: "SPT-RNR-002", categoryId: "cat4", price: 1500, cost: 800, stock: 60 },
      { id: "p8", name: "Leather Loafer", sku: "FRM-LOF-001", categoryId: "cat3", price: 2000, cost: 1000, stock: 45 },
    ],
    customers: [
      { id: "cust1", name: "Rahim Enterprises", email: "rahim@enterprise.com", phone: "+880 1711-111111", address: "Mirpur, Dhaka", balance: 25000 },
      { id: "cust2", name: "Karim Traders", email: "karim@traders.com", phone: "+880 1722-222222", address: "Gulshan, Dhaka", balance: 0 },
      { id: "cust3", name: "Fatima Boutique", email: "fatima@boutique.com", phone: "+880 1733-333333", address: "Banani, Dhaka", balance: 40000 },
      { id: "cust4", name: "Sara Fashion House", email: "sara@fashion.com", phone: "+880 1744-444444", address: "Uttara, Dhaka", balance: 0 },
      { id: "cust5", name: "Downtown Retail", email: "info@downtown.com", phone: "+880 1755-555555", address: "Motijheel, Dhaka", balance: 60000 },
    ],
    suppliers: [
      { id: "sup1", name: "Leather Masters BD", email: "info@leathermasters.com", phone: "+880 1811-111111", address: "Chattogram", balance: 35000 },
      { id: "sup2", name: "Footwear Components Ltd", email: "sales@fcl.com", phone: "+880 1822-222222", address: "Narayanganj", balance: 0 },
      { id: "sup3", name: "Textile Source Inc", email: "orders@textilesource.com", phone: "+880 1833-333333", address: "Gazipur", balance: 45000 },
      { id: "sup4", name: "Sole Makers Co", email: "info@solemakers.com", phone: "+880 1844-444444", address: "Savar", balance: 30000 },
      { id: "sup5", name: "Artisan Supply House", email: "contact@artisan.com", phone: "+880 1855-555555", address: "Comilla", balance: 0 },
    ],
    users: [
      { id: "u1", name: "Aiyaan", email: "aiyaan@ayanscrafts.com", role: "Admin" },
      { id: "u2", name: "Fatima Khan", email: "fatima@ayanscrafts.com", role: "Manager" },
      { id: "u3", name: "Rahim Hassan", email: "rahim@ayanscrafts.com", role: "Sales Staff" },
      { id: "u4", name: "Sara Ahmed", email: "sara@ayanscrafts.com", role: "Viewer" },
    ],
  };

  return NextResponse.json({
    message: "Database seeded successfully for Ayan's Crafts",
    data: seedData,
  });
}
