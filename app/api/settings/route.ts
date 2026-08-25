import { NextRequest, NextResponse } from "next/server";

let settings = {
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
  branding: {
    primaryColor: "#4f46e5",
    secondaryColor: "#565e74",
    logoUrl: null as string | null,
    faviconUrl: null as string | null,
  },
  notifications: {
    lowStockAlerts: true,
    newSaleNotifications: true,
    purchaseAlerts: true,
    systemUpdates: false,
  },
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (body.organization) {
    settings.organization = { ...settings.organization, ...body.organization };
  }
  if (body.branding) {
    settings.branding = { ...settings.branding, ...body.branding };
  }
  if (body.notifications) {
    settings.notifications = { ...settings.notifications, ...body.notifications };
  }

  return NextResponse.json({ message: "Settings updated successfully", settings });
}
