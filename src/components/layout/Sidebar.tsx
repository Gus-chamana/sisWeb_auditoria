"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  FolderOpen,
  FileText,
  BarChart3,
  Users,
  Settings,
  Bell,
  LogOut,
  Plus,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={18} strokeWidth={2} />,
    },
    {
      name: "Visitas",
      href: "/admin/visitas",
      icon: <Calendar size={18} strokeWidth={2} />,
    },
    {
      name: "Inspecciones",
      href: "/admin/inspecciones",
      icon: <ClipboardCheck size={18} strokeWidth={2} />,
    },
    {
      name: "Evidencias",
      href: "/admin/evidencias",
      icon: <FolderOpen size={18} strokeWidth={2} />,
    },
    {
      name: "Reportes",
      href: "/admin/reportes",
      icon: <FileText size={18} strokeWidth={2} />,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 size={18} strokeWidth={2} />,
    },
    {
      name: "Usuarios",
      href: "/admin/usuarios",
      icon: <Users size={18} strokeWidth={2} />,
    },
    {
      name: "Configuración",
      href: "/admin/configuracion",
      icon: <Settings size={18} strokeWidth={2} />,
    },
    {
      name: "Notificaciones",
      href: "/admin/notificaciones",
      badge: "3",
      icon: <Bell size={18} strokeWidth={2} />,
    },
  ];

  return (
    <aside className="w-280 bg-sivac-bg-surface border-r border-sivac-border flex flex-col justify-between h-screen fixed left-0 top-0 z-30 font-inter">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-sivac-border">
          <div className="flex items-center gap-3">
            <div className="relative w-[50px] h-[50px] rounded-lg overflow-hidden bg-sivac-blue/5 border border-sivac-blue/10 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="SIVAC Logo"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-poppins text-20 font-bold text-sivac-indigo-light leading-none">
                SIVAC
              </h2>
              <p className="text-11 text-sivac-muted mt-1 leading-none font-medium">
                Supervisión Académica
              </p>
            </div>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-6 py-4">
          <p className="text-12 font-semibold text-sivac-muted tracking-wide-06 uppercase">
            GESTIÓN INSTITUCIONAL
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-14 font-medium transition-all group ${
                  isActive
                    ? "nav-link-active text-[#dbe1ff] border border-sivac-indigo/30 bg-sivac-blue/[0.03]"
                    : "text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-secondary border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? "text-sivac-indigo" : "text-sivac-muted group-hover:text-sivac-heading"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-sivac-blue text-11 text-sivac-surface font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="p-4 border-t border-sivac-border">
          <Link
            href="/admin/inspecciones"
            className="w-full h-[40px] flex items-center justify-center gap-2 rounded bg-sivac-blue hover:bg-blue-700 text-sivac-surface text-12 font-bold tracking-wide-06 transition-colors shadow-lg shadow-sivac-blue/10 uppercase"
          >
            <Plus size={16} strokeWidth={2.5} />
            NUEVA VISITA
          </Link>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sivac-border bg-sivac-bg-secondary/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sivac-blue/10 border border-sivac-blue/20 flex items-center justify-center text-sivac-indigo font-poppins font-semibold text-16 shadow-inner">
          AS
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-14 font-semibold text-sivac-heading truncate leading-none mb-1">
            Admin. Supervisor
          </h4>
          <p className="text-12 font-medium text-sivac-muted truncate leading-none">
            ID: SUP-9021
          </p>
        </div>
        {/* Logout Visual Link */}
        <Link href="/login" className="text-sivac-muted hover:text-sivac-red transition-colors p-1.5 rounded-lg hover:bg-sivac-bg-secondary/50">
          <LogOut size={18} strokeWidth={2} />
        </Link>
      </div>
    </aside>
  );
}
