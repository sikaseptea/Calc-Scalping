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
} from "lucide-react";

const menus = [
  {
    label: "Calculator",
    href: "/calculator",
    icon: Calculator,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    label: "Compound",
    href: "/compound",
    icon: TrendingUp,
  },
  {
  label: "Crypto",
  href: "/crypto",
  icon: TrendingUp,
  },
];

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
};

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {

  const pathname = usePathname();

  return (
    <aside
  className={`
    fixed
    left-0
    top-0
    h-screen
    z-50
    bg-black
    border-r
    border-zinc-800
    transition-all
    duration-300
    flex
    flex-col
    ${
      collapsed
        ? "w-20"
        : "w-72"
    }
  `}
>
    
      {/* Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-[2px] h-full bg-green-500 shadow-[0_0_20px_4px_rgba(34,197,94,.7)]" />
      </div>

      {/* Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-green-500 text-2xl font-bold tracking-widest">
              Calc-Scalping
            </h1>
            <p className="text-xs text-zinc-500">
              By Sikasep Ado
            </p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-2
            rounded-lg
            bg-zinc-900
            hover:bg-zinc-800
            text-zinc-300
          "
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
              title={collapsed ? menu.label : ""}
              className={`
                relative
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                transition-all
                duration-200
                group
                ${
                  active
                    ? `
                      bg-green-500/10
                      text-green-400
                      border
                      border-green-500/20
                    `
                    : `
                      text-zinc-400
                      hover:text-white
                      hover:bg-zinc-900
                    `
                }
              `}
            >
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-green-500" />
              )}

              <Icon
                size={22}
                className={
                  active
                    ? "text-green-400"
                    : ""
                }
              />

              {!collapsed && (
                <span className="font-medium">
                  {menu.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer User */}
      <div className="border-t border-zinc-800 p-4">
        <div
          className="
            flex
            items-center
            gap-3
            bg-zinc-900
            rounded-xl
            p-3
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-green-500
              flex
              items-center
              justify-center
            "
          >
            <User
              size={18}
              className="text-black"
            />
          </div>

          {!collapsed && (
            <div>
              <div className="text-sm font-semibold">
                Trader
              </div>

              <div className="text-xs text-zinc-500">
                Premium Account
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}