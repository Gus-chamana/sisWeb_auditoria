"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function RecuperarPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-sivac-bg-primary font-inter flex flex-col justify-between items-center p-6 relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-sivac-blue/5 blur-[150px] pointer-events-none" />

      {/* Header - Back Button */}
      <header className="w-full max-w-6xl flex justify-start z-10">
        <Link
          href="/login"
          className="w-12 h-12 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </Link>
      </header>

      {/* Main Glassmorphism Card */}
      <div className="my-auto w-full max-w-lg z-10">
        <div className="bg-[#1f29375c] rounded-xl border border-sivac-border-glass p-2 backdrop-blur-glass shadow-2xl">
          <div className="bg-sivac-bg-surface rounded-lg border border-sivac-border p-8 sm:p-10">
            {/* Header Content */}
            <div className="text-center mb-8">
              <h2 className="font-poppins text-28 sm:text-32 font-bold text-sivac-heading mb-2">
                Recuperar Acceso
              </h2>
              <p className="text-14 font-normal text-sivac-body">
                Ingresa tu correo institucional y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-12 font-medium text-sivac-muted tracking-wide-06 uppercase mb-2">
                  CORREO INSTITUCIONAL
                </label>
                <input
                  type="email"
                  required
                  placeholder="ej. supervisor@institucion.edu"
                  className="w-full h-[48px] px-4 bg-sivac-bg-secondary border border-sivac-border rounded text-sivac-heading text-14 outline-none focus:border-sivac-blue transition-colors placeholder:text-sivac-border"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[48px] rounded bg-sivac-blue hover:bg-blue-700 text-sivac-surface text-14 font-bold tracking-wide-06 uppercase transition-colors shadow-lg shadow-sivac-blue/20"
              >
                Enviar enlace de recuperación
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 border-b border-sivac-border" />

            {/* Link back */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sivac-indigo hover:text-sivac-heading text-14 font-medium transition-colors"
              >
                <ArrowLeft size={16} strokeWidth={2} />
                Volver al login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center z-10 py-4">
        <p className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
          SISTEMA DE SUPERVISIÓN ACADÉMICA
        </p>
      </footer>
    </main>
  );
}
