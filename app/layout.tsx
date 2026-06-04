import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calc-Sikasep",
  description: "Trading Scalping By Sikasep Ado",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}