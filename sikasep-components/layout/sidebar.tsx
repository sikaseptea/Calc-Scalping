"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  LineChart,
  Newspaper,
  Wallet,
  BrainCircuit,
} from "lucide-react";

const menu = [
  {
    title: "Home",
    href: "/sikasep",
    icon: LayoutDashboard,
  },
  {
    title: "Market Overview",
    href: "/sikasep/market",
    icon: LineChart,
  },
  {
    title: "News & Sentiment",
    href: "/sikasep/sentiment",
    icon: Newspaper,
  },
  {
    title: "Smart Money",
    href: "/sikasep/smart-money",
    icon: Wallet,
  },
  {
    title: "AI Outlook",
    href: "/sikasep/ai-outlook",
    icon: BrainCircuit,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 border-r border-zinc-800 bg-zinc-950">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">
          Sikasep News
        </h1>

        <p className="text-sm text-zinc-500">
          Crypto Intelligence Platform
        </p>
      </div>

      <nav className="px-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-xl p-3 transition-all ${
                pathname === item.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}