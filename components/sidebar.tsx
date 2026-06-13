"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import {
  Calculator,
  TrendingUp,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Wallet,
} from "lucide-react";

const menus = [
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Compound", href: "/compound", icon: TrendingUp },
  { label: "Crypto", href: "/crypto", icon: TrendingUp },
  { label: "Actual", href: "/actual", icon: BarChart3 },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`
        fixed left-0 top-0 h-screen z-50
        bg-black border-r border-zinc-800
        flex flex-col overflow-hidden

        transition-[width]
        duration-300
        ease-out

        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-[2px] h-full bg-green-500 shadow-[0_0_20px_4px_rgba(34,197,94,.7)]" />
      </div>

      {/* Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <div
          className={`
            transition-all duration-200 ease-out overflow-hidden
            ${
              collapsed
                ? "opacity-0 -translate-x-2"
                : "opacity-100 translate-x-0"
            }
          `}
        >
          <h1 className="text-green-500 text-2xl font-bold tracking-widest">
            Calc-Scalping
          </h1>
          <p className="text-xs text-zinc-500">By Sikasep Ado</p>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              title={menu.label}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl
                transition-all duration-200 ease-out
                group

                ${
                  active
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-green-500" />
              )}

              {/* ICON FIXED (NO SHRINK ISSUE) */}
              <div className="w-10 flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>

              {/* LABEL */}
              <span
                className={`
                  font-medium whitespace-nowrap
                  transition-all duration-200 ease-out
                  ${
                    collapsed
                      ? "opacity-0 translate-x-[-6px] w-0"
                      : "opacity-100 translate-x-0"
                  }
                `}
              >
                {menu.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <User size={18} className="text-black" />
          </div>

          <div
            className={`
              transition-all duration-200 ease-out overflow-hidden
              ${
                collapsed
                  ? "opacity-0 translate-x-[-6px]"
                  : "opacity-100 translate-x-0"
              }
            `}
          >
            <div className="text-sm font-semibold">Trader</div>
            <div className="text-xs text-zinc-500">Premium Account</div>
          </div>
        </div>
      </div>
    </aside>
  );
}