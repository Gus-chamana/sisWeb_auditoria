"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="h-[72px] bg-sivac-bg-primary border-b border-sivac-border flex items-center justify-between px-8 sticky top-0 z-20 font-inter">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sivac-muted">
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          type="text"
          placeholder="Buscar visitas, docentes, sedes..."
          className="input-admin w-full h-[40px] pl-10 pr-4 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <Link
          href="/admin/notificaciones"
          className="w-10 h-10 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors relative"
        >
          <Bell size={18} strokeWidth={2} />
          {/* Badge count notification indicator */}
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sivac-blue rounded-full border border-sivac-bg-toggle" />
        </Link>

        {/* Profile Button */}
        <button
          type="button"
          className="h-10 px-4 flex items-center gap-2.5 bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors"
        >
          <div className="w-6 h-6 rounded-lg bg-sivac-blue/10 flex items-center justify-center text-sivac-indigo text-11 font-semibold">
            AS
          </div>
          <span className="text-14 font-medium">Perfil</span>
          <ChevronDown size={14} strokeWidth={2} className="text-sivac-muted" />
        </button>
      </div>
    </header>
  );
}
