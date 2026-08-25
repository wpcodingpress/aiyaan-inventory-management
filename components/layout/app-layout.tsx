"use client";

import Sidebar from "./sidebar";
import TopBar from "./topbar";

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <TopBar title={title} />
      <main className="ml-[260px] mt-[64px] p-6">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
