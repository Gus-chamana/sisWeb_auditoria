"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Info,
} from "lucide-react";
import {
  getRolLabel,
  getRolColor,
  type UserRole,
} from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

// -----------------------------------------------------------
// Definición de rutas del menú y sus permisos por rol
// -----------------------------------------------------------
interface NavItem {
  name: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
  /** Roles que pueden ver esta opción del menú */
  roles: UserRole[];
}

const MOCK_OPTIONS = [
  {
    id: "visit-1",
    aula: "Aula B-402",
    asignatura: "Arquitectura de Software (12402)",
    docente: "Dr. Ing. Hugo Cabrera Rojas",
    sedeFilial: "Sede Central - Lima",
    ciclo: "2026-I",
    turno: "Noche",
  },
  {
    id: "visit-2",
    aula: "Aula A-301",
    asignatura: "Ingeniería de Requerimientos (12405)",
    docente: "Mag. Elena Valenzuela Soto",
    sedeFilial: "Sede Norte - Los Olivos",
    ciclo: "2026-I",
    turno: "Tarde",
  },
  {
    id: "visit-3",
    aula: "Aula C-102",
    asignatura: "Diseño y Patrones de Software (12410)",
    docente: "Ing. Carlos Alberto Mendoza Ortiz",
    sedeFilial: "Sede Sur - Chorrillos",
    ciclo: "2025-II",
    turno: "Mañana",
  },
  {
    id: "visit-4",
    aula: "Aula A-101",
    asignatura: "Base de Datos I (11029)",
    docente: "María García López",
    sedeFilial: "Sede Norte - Los Olivos",
    ciclo: "2026-I",
    turno: "Noche",
  },
  {
    id: "visit-5",
    aula: "Aula B-205",
    asignatura: "Calidad de Software (12480)",
    docente: "Pedro Martínez Díaz",
    sedeFilial: "Sede Central - Lima",
    ciclo: "2026-I",
    turno: "Tarde",
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showModal, setShowModal] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Escuchar si la URL pide abrir el modal
  useEffect(() => {
    if (searchParams.get("newInspection") === "true") {
      setShowModal(true);
    }
  }, [searchParams]);

  const handleCloseModal = () => {
    setShowModal(false);
    // Limpiar el parámetro de la URL
    const params = new URLSearchParams(window.location.search);
    params.delete("newInspection");
    const queryStr = params.toString();
    router.push(pathname + (queryStr ? `?${queryStr}` : ""));
  };

  const handleAcceptModal = () => {
    setShowModal(false);
    
    // Limpiar el parámetro de la URL en la página actual
    const params = new URLSearchParams(window.location.search);
    params.delete("newInspection");
    const queryStr = params.toString();
    router.replace(pathname + (queryStr ? `?${queryStr}` : ""));
    
    // Redirigir a la pantalla de inspecciones
    router.push("/admin/inspecciones");
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor"],
    },
    {
      name: "Visitas",
      href: "/admin/visitas",
      icon: <Calendar size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor", "Docente"],
    },
    {
      name: "Evidencias",
      href: "/admin/evidencias",
      icon: <FolderOpen size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor"],
    },
    {
      name: "Reportes",
      href: "/admin/reportes",
      icon: <FileText size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor", "Docente"],
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor"],
    },
    {
      name: "Usuarios",
      href: "/admin/usuarios",
      icon: <Users size={18} strokeWidth={2} />,
      roles: ["Admin"],
    },
    {
      name: "Configuración",
      href: "/admin/configuracion",
      icon: <Settings size={18} strokeWidth={2} />,
      roles: ["Admin"],
    },
    {
      name: "Notificaciones",
      href: "/admin/notificaciones",
      badge: "3",
      icon: <Bell size={18} strokeWidth={2} />,
      roles: ["Admin", "Auditor", "Docente"],
    },
  ];

  // Filtrar menú según el rol activo
  if (loading) {
    return (
      <aside className="w-280 bg-sivac-bg-surface border-r border-sivac-border flex flex-col justify-between h-screen fixed left-0 top-0 z-30 font-inter animate-pulse">
        <div className="p-6 border-b border-sivac-border h-[99px]" />
        <div className="flex-grow px-4 py-8 space-y-4">
          <div className="h-10 bg-white/5 rounded-lg w-full" />
          <div className="h-10 bg-white/5 rounded-lg w-full" />
          <div className="h-10 bg-white/5 rounded-lg w-full" />
        </div>
      </aside>
    );
  }

  if (!user) return null;

  const ROL_ACTIVO = user.rol;
  const currentUser = user;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(ROL_ACTIVO)
  );

  // Etiqueta de sección según el rol
  const sectionLabel =
    ROL_ACTIVO === "Admin"
      ? "GESTIÓN INSTITUCIONAL"
      : ROL_ACTIVO === "Auditor"
        ? "PANEL DE AUDITORÍA"
        : "MI ESPACIO DOCENTE";

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

        {/* Section Label — cambia según el rol */}
        <div className="px-6 py-4">
          <p className="text-12 font-semibold text-sivac-muted tracking-wide-06 uppercase">
            {sectionLabel}
          </p>
        </div>

        {/* Navigation Items — filtrados por rol */}
        <nav className="flex-1 px-4 space-y-1">
          {filteredNavItems.map((item) => {
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

        {/* Action Button — Solo visible para Auditor */}
        {ROL_ACTIVO === "Auditor" && (
          <div className="p-4 border-t border-sivac-border">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full h-[40px] flex items-center justify-center gap-2 rounded bg-sivac-blue hover:bg-blue-700 text-sivac-surface text-12 font-bold tracking-wide-06 transition-colors shadow-lg shadow-sivac-blue/10 uppercase cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              NUEVA INSPECCIÓN
            </button>
          </div>
        )}
      </div>

      {/* User Profile — Datos dinámicos según el rol */}
      <div className="p-4 border-t border-sivac-border bg-sivac-bg-secondary/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sivac-blue/10 border border-sivac-blue/20 flex items-center justify-center text-sivac-indigo font-poppins font-semibold text-16 shadow-inner">
          {currentUser.iniciales}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-14 font-semibold text-sivac-heading truncate leading-none mb-1">
            {currentUser.nombre}
          </h4>
          <div className="flex items-center gap-2">
            <span className="text-12 font-medium text-sivac-muted truncate leading-none">
              ID: {currentUser.id}
            </span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border leading-none ${getRolColor(
                currentUser.rol
              )}`}
            >
              {getRolLabel(currentUser.rol)}
            </span>
          </div>
        </div>
        {/* Logout Visual Link */}
        <button
          type="button"
          onClick={signOut}
          className="text-sivac-muted hover:text-sivac-red transition-colors p-1.5 rounded-lg hover:bg-sivac-bg-secondary/50 cursor-pointer"
        >
          <LogOut size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Modal de instrucciones para Nueva Inspección */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light no-print">
          <div className="bg-sivac-bg-surface border border-white/10 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            {/* Icon and Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-12 h-12 rounded-xl bg-sivac-blue/15 text-sivac-blue flex items-center justify-center border border-sivac-blue/30 shrink-0">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h3 className="text-18 font-bold font-poppins text-sivac-heading leading-tight">
                  Instrucciones de Inspección
                </h3>
                <p className="text-12 text-sivac-muted mt-1">
                  Lee las indicaciones antes de iniciar la inspección en aula.
                </p>
              </div>
            </div>

            {/* Warning/Info Box */}
            <div className="p-4 rounded-xl bg-sivac-yellow/10 border border-sivac-yellow/30 text-sivac-yellow-soft space-y-2">
              <div className="flex gap-2.5 items-start">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p className="text-13 leading-relaxed font-medium">
                  Al finalizar la inspección debe realizar una foto (tomar captura) o de lo contrario debe subir una y seleccionar la inspección que le corresponda.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                className="h-[40px] px-5 rounded-lg border border-white/10 text-13 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAcceptModal}
                className="h-[40px] px-6 rounded-lg text-13 font-bold transition-all uppercase tracking-wider bg-sivac-blue hover:bg-blue-700 text-sivac-surface shadow-lg shadow-sivac-blue/15 cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
