"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { LayoutGrid, CheckCircle2, Cloud, RefreshCw, Sun } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/admin/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-sivac-bg-primary font-inter">
      {/* Panel Izquierdo - Branding & Stats */}
      <section className="hidden md:flex md:w-1/2 bg-sivac-bg-secondary p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-sivac-border">
        {/* Decorative Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sivac-blue/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sivac-indigo/10 blur-[120px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-4 z-10">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sivac-blue/5 border border-sivac-blue/10 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="SIVAC Logo"
              width={64}
              height={64}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-poppins text-32 font-bold text-sivac-indigo leading-none tracking-[-0.8px]">
              SIVAC
            </h1>
            <p className="text-12 font-semibold text-sivac-body tracking-wide-14 uppercase mt-1">
              SISTEMA WEB INTELIGENTE
            </p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="my-auto py-12 z-10 max-w-xl">
          <h2 className="font-poppins text-40 lg:text-48 font-bold text-sivac-heading leading-[1.15] tracking-[-0.96px] mb-6">
            Gestión Académica de Alta Precisión.
          </h2>
          <p className="text-16 font-normal text-sivac-body leading-relaxed max-w-lg">
            Control centralizado, auditorías en tiempo real y sincronización offline para una supervisión académica sin fricciones.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 z-10">
          {/* Card 1 */}
          <GlassCard className="flex flex-col justify-between h-[140px] p-5">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-sivac-indigo/10 text-sivac-indigo">
                <LayoutGrid size={20} strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="font-poppins text-24 lg:text-28 font-semibold text-sivac-heading">
                +10,000
              </p>
              <p className="text-10 lg:text-12 font-medium text-sivac-body tracking-wide-06 uppercase">
                VISITAS REGISTRADAS
              </p>
            </div>
          </GlassCard>

          {/* Card 2 */}
          <GlassCard className="flex flex-col justify-between h-[140px] p-5">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-lg bg-sivac-green-soft/10 text-sivac-green-soft">
                <CheckCircle2 size={20} strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="font-poppins text-24 lg:text-28 font-semibold text-sivac-heading">
                95%
              </p>
              <p className="text-10 lg:text-12 font-medium text-sivac-body tracking-wide-06 uppercase">
                AUDITORÍAS COMPLETADAS
              </p>
            </div>
          </GlassCard>

          {/* Card 3 - Full-width */}
          <GlassCard className="col-span-2 flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-sivac-blue/10 text-sivac-blue flex-shrink-0">
                <Cloud size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Sistema Online / Offline
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-0.5">
                  Sincronización automática de evidencias al recuperar conexión.
                </p>
              </div>
            </div>
            <div className="text-sivac-muted">
              <RefreshCw size={20} strokeWidth={2} className="animate-spin" />
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Panel Derecho - Formulario de Acceso */}
      <section className="w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-24 relative">
        {/* Toggle Mode Button (Top-Right) */}
        <div className="self-end z-10">
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors"
          >
            <Sun size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Login Form Container */}
        <div className="my-auto max-w-md w-full mx-auto z-10 py-8">
          <div className="mb-8">
            <h3 className="font-poppins text-32 lg:text-40 font-bold text-sivac-heading mb-2">
              Iniciar Sesión
            </h3>
            <p className="text-14 font-normal text-sivac-body">
              Ingresa tus credenciales institucionales para acceder a la plataforma.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-12 font-medium text-sivac-muted tracking-wide-06 uppercase mb-2">
                USUARIO INSTITUCIONAL
              </label>
              <input
                type="text"
                required
                placeholder="ej. supervisor@institucion.edu"
                className="input-login w-full h-[48px] px-4 text-14"
              />
            </div>

            <div>
              <label className="block text-12 font-medium text-sivac-muted tracking-wide-06 uppercase mb-2">
                CONTRASEÑA
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-login w-full h-[48px] px-4 text-14 tracking-widest"
              />
            </div>

            <div className="flex items-center justify-between text-14 text-sivac-body">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-sivac-border bg-sivac-bg-input text-sivac-blue focus:ring-sivac-blue focus:ring-offset-0 focus:ring-2"
                />
                <span className="text-14 font-normal">Recordar sesión</span>
              </label>
              <Link
                href="/recuperar"
                className="text-14 font-medium text-sivac-indigo hover:text-sivac-heading transition-colors"
              >
                ¿Recuperar contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] rounded bg-sivac-blue hover:bg-blue-700 text-sivac-surface text-12 font-bold tracking-wide-06 transition-colors shadow-lg shadow-sivac-blue/20 uppercase"
            >
              INICIAR SESIÓN
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center z-10">
          <p className="text-14 font-normal text-sivac-body">
            ¿Problemas de acceso?{" "}
            <a
              href="mailto:soporte@institucion.edu"
              className="text-14 font-semibold text-sivac-indigo hover:underline"
            >
              Contactar a Soporte TI
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
