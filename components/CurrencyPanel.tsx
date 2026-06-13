"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();

  const active = (path: string) =>
    pathname === path ? "#22c55e" : "#94a3b8";

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 12,
        borderBottom: "1px solid #1f2937",
        background: "#0b0f1a",
      }}
    >
      <Link href="/calculator" style={{ color: active("/calculator") }}>
        Calculator
      </Link>

      <Link href="/crypto" style={{ color: active("/crypto") }}>
        Crypto
      </Link>

      <Link href="/progress" style={{ color: active("/progress") }}>
        Progress
      </Link>

      <Link href="/compound" style={{ color: active("/compound") }}>
        Compound
      </Link>
    </div>
  );
}