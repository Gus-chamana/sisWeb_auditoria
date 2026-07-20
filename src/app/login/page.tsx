"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { LayoutGrid, CheckCircle2, Cloud, RefreshCw, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTheme } from "@/lib/ThemeContext";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Credenciales de acceso incorrectas.");
        } else {
          setErrorMsg(error.message);
        }
      } else {
        router.push("/admin/visitas");
      }
    } catch (err: any) {
      setErrorMsg("Ocurrió un error inesperado al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-sivac-bg-primary font-inter">
      { }
      <section className="hidden md:flex md:w-1/2 bg-sivac-bg-secondary p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-sivac-border">
        { }
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sivac-blue/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sivac-indigo/10 blur-[120px] pointer-events-none" />

        { }
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

        { }
        <div className="my-auto py-12 z-10 max-w-xl">
          <h2 className="font-poppins text-40 lg:text-48 font-bold text-sivac-heading leading-[1.15] tracking-[-0.96px] mb-6">
            Gestión Académica de Alta Precisión.
          </h2>
          <p className="text-16 font-normal text-sivac-body leading-relaxed max-w-lg">
            Control centralizado, auditorías en tiempo real para una supervisión académica sin fricciones.
          </p>
        </div>

        { }
        <div className="grid grid-cols-2 gap-4 z-10">
          { }
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

          { }
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

          { }
          <GlassCard className="col-span-2 flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-sivac-blue/10 text-sivac-blue flex-shrink-0">
                <Cloud size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Sistema Online
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-0.5">
                  Sincronización automática de evidencias.
                </p>
              </div>
            </div>
            <div className="text-sivac-muted">
              <RefreshCw size={20} strokeWidth={2} className="animate-spin" />
            </div>
          </GlassCard>
        </div>
      </section>

      { }
      <section className="w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-24 relative">
        { }
        <div className="self-end z-10">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-12 h-12 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors"
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? (
              <Sun size={20} strokeWidth={2} />
            ) : (
              <Moon size={20} strokeWidth={2} />
            )}
          </button>
        </div>

        { }
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
            {errorMsg && (
              <div className="p-3.5 text-13 text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-12 font-medium text-sivac-muted tracking-wide-06 uppercase mb-2">
                USUARIO INSTITUCIONAL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. supervisor@institucion.edu"
                className="input-login w-full h-[48px] px-4 text-14"
              />
            </div>

            <div>
              <label className="block text-12 font-medium text-sivac-muted tracking-wide-06 uppercase mb-2">
                CONTRASEÑA
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`input-login w-full h-[48px] pl-4 pr-12 text-14 ${showPassword ? "" : "tracking-widest"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-sivac-muted hover:text-sivac-light transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center text-14 text-sivac-body">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-sivac-border bg-sivac-bg-input text-sivac-blue focus:ring-sivac-blue focus:ring-offset-0 focus:ring-2"
                />
                <span className="text-14 font-normal">Recordar sesión</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[48px] rounded text-sivac-surface text-12 font-bold tracking-wide-06 transition-colors shadow-lg uppercase flex items-center justify-center gap-2 ${loading
                  ? "bg-sivac-blue/50 cursor-not-allowed shadow-none"
                  : "bg-sivac-blue hover:bg-blue-700 shadow-sivac-blue/20"
                }`}
            >
              {loading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
            </button>
          </form>
        </div>

        { }
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
