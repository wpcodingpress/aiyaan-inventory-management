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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  users[index] = { ...users[index], ...body, id };
  return NextResponse.json(users[index]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  users[index].status = "Inactive";
  return NextResponse.json({ message: "User deactivated", user: users[index] });
}
