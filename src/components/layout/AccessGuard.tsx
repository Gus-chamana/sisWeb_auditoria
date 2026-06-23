import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getRolLabel, type UserRole } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

interface AccessGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function AccessGuard({ children, allowedRoles }: AccessGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] space-y-4 font-inter animate-pulse">
        <div className="w-20 h-20 bg-white/5 rounded-2xl" />
        <div className="w-40 h-6 bg-white/5 rounded-md" />
        <div className="w-60 h-4 bg-white/5 rounded-md" />
      </div>
    );
  }

  if (!user) return null;

  const ROL_ACTIVO = user.rol;
  const tieneAcceso = allowedRoles.includes(ROL_ACTIVO);

  if (tieneAcceso) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 my-auto min-h-[60vh] space-y-6 font-inter">
      {/* Icon Shield Accent */}
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-sivac-red-light flex items-center justify-center shadow-xl shadow-red-500/5 animate-pulse">
        <ShieldAlert size={40} />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-22 font-bold font-poppins text-sivac-light">
          Acceso Restringido
        </h2>
        <p className="text-14 text-sivac-muted">
          Tu cuenta actual con el rol <span className="font-bold text-[#ffb4ab] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase text-11">{getRolLabel(ROL_ACTIVO)}</span> no cuenta con permisos suficientes para visualizar este módulo.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href={ROL_ACTIVO === "Docente" ? "/admin/reportes" : "/admin/dashboard"}
          className="h-[40px] px-5 bg-sivac-bg-secondary border border-sivac-border hover:bg-sivac-bg-toggle text-sivac-body hover:text-sivac-heading rounded-lg text-13 font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Volver al Inicio</span>
        </Link>
      </div>
    </div>
  );
}
