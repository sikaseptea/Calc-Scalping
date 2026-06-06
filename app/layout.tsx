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
      <body style={{ margin: 0, background: "#0b0f1a", color: "white" }}>
        {children}
      </body>
    </html>
  );
}