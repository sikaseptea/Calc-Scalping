import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { startScheduler } from "@/lib/orchestrator/scheduler";
import { ReactNode } from "react";

export function startETFIngestCron() {
  // jalan sekali saat server start
  console.log("🟢 ETF Cron Started (LOCAL MODE)");

  setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/sikasep/etf-ingest");
      const json = await res.json();

      console.log("ETF CRON:", json);
    } catch (err) {
      console.error("ETF CRON ERROR:", err);
    }
  }, 24 * 60 * 60 * 1000); // 24 jam
}

// FONT
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// ⚠️ SAFE GUARD (biar tidak double run di dev mode)
let schedulerStarted = false;

if (!schedulerStarted) {
  schedulerStarted = true;
  startScheduler();
}

export const metadata: Metadata = {
  title: "Calc-Sikasep",
  description: "Trading Scalping By Sikasep Ado",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}