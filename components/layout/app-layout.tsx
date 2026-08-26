"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import TopBar from "./topbar";

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <TopBar title={title} onMenuToggle={toggleSidebar} />
      <main className="ml-0 md:ml-[260px] mt-[64px] p-4 md:p-6 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
