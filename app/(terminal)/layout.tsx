"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] =
    useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          p-6
          ${
            collapsed
              ? "ml-20"
              : "ml-72"
          }
        `}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}