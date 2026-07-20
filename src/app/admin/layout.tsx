"use client";

import React, { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sivac-bg-primary text-sivac-light font-inter">
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      <div className="pl-280 flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <Header />
        </Suspense>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
