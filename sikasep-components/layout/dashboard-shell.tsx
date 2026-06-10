import { ReactNode } from "react";

import Sidebar from "./sidebar";
import Header from "./header";

interface Props {
  children: ReactNode;
}

export default function DashboardShell({
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}