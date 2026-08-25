import { NextRequest, NextResponse } from "next/server";

let users = [
  {
    id: "u1",
    name: "Aiyaan",
    email: "aiyaan@ayanscrafts.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2026-08-25 09:30",
  },
  {
    id: "u2",
    name: "Fatima Khan",
    email: "fatima@ayanscrafts.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-08-24 14:15",
  },
  {
    id: "u3",
    name: "Rahim Hassan",
    email: "rahim@ayanscrafts.com",
    role: "Sales Staff",
    status: "Active",
    lastLogin: "2026-08-25 08:00",
  },
  {
    id: "u4",
    name: "Sara Ahmed",
    email: "sara@ayanscrafts.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2026-07-20 11:45",
  },
];

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name || !body.email || !body.role) {
    return NextResponse.json(
      { error: "Name, email, and role are required" },
      { status: 400 }
    );
  }

  const newUser = {
    id: `u${Date.now()}`,
    name: body.name,
    email: body.email,
    role: body.role,
    status: "Active",
    lastLogin: "Never",
  };

  users.push(newUser);
  return NextResponse.json(newUser, { status: 201 });
}
