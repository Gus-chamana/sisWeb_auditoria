"use client";

import React, { useState } from "react";
import { Info, ArrowLeft, ArrowRight } from "lucide-react";

export default function InspeccionesPage() {
  const [selectedQ1, setSelectedQ1] = useState("si-puntual");
  const [selectedQ2, setSelectedQ2] = useState("alto");

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-inter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-sivac-border-card pb-6">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Inspección en Curso
          </h1>
          <p className="text-14 font-normal text-sivac-muted mt-1.5">
            Docente: <span className="text-sivac-light font-semibold">María García L.</span> · Sede Central · Matemática Básica
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e3a8a33] border border-[#1e3a8a80] text-[#93c5fd] self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-[#60a5fa] animate-pulse" />
          <span className="text-12 font-medium">Guardando localmente...</span>
        </div>
      </div>

      {/* Progress Wizard Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-12 font-semibold text-sivac-muted">
          <span>Progreso de Auditoría</span>
          <span>Paso 3 de 7 (38%)</span>
        </div>
        {/* Progress Dots / Bar: 2 green (completed), 1 blue (current), 4 gray (pending) */}
        <div className="grid grid-cols-7 gap-2">
          <div className="h-2.5 rounded bg-sivac-green" title="Completado" />
          <div className="h-2.5 rounded bg-sivac-green" title="Completado" />
          <div className="h-2.5 rounded bg-sivac-blue" title="Paso Actual" />
          <div className="h-2.5 rounded bg-sivac-border-card" title="Pendiente" />
          <div className="h-2.5 rounded bg-sivac-border-card" title="Pendiente" />
          <div className="h-2.5 rounded bg-sivac-border-card" title="Pendiente" />
          <div className="h-2.5 rounded bg-sivac-border-card" title="Pendiente" />
        </div>
      </div>

      {/* Step Title */}
      <div>
        <h2 className="text-20 font-bold text-sivac-light">
          Paso 2: Control Docente
        </h2>
        <p className="text-12 font-normal text-sivac-muted mt-0.5">
          Verifica la puntualidad y el nivel de interacción académica durante la sesión.
        </p>
      </div>

      {/* Form Container */}
      <div className="admin-card p-6 sm:p-8 space-y-8 shadow-xl">
        {/* Banner Informative Alert */}
        <div className="p-4 rounded-lg bg-[#1e3a8a1a] border border-[#1e3a8a80] text-[#bfdbfe] flex gap-3 items-start">
          <Info size={18} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
          <div className="text-13 sm:text-14 leading-relaxed font-normal">
            <span className="font-bold">Sección: Desarrollo de la sesión.</span> Asegúrate de observar al menos 15 minutos continuos de interacción docente-estudiante antes de registrar la puntuación de interacción.
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {/* Question 1 */}
          <div className="space-y-3">
            <label className="block text-14 font-semibold text-sivac-light">
              1. ¿Docente se encuentra presente en el aula?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Selected */}
              <button
                type="button"
                onClick={() => setSelectedQ1("si-puntual")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ1 === "si-puntual"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">Sí, puntual</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ1 === "si-puntual" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ1 === "si-puntual" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                onClick={() => setSelectedQ1("si-retraso")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ1 === "si-retraso"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">Sí, con retraso</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ1 === "si-retraso" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ1 === "si-retraso" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>

              {/* Option 3 */}
              <button
                type="button"
                onClick={() => setSelectedQ1("no-presento")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ1 === "no-presento"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">No se presentó</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ1 === "no-presento" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ1 === "no-presento" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>
            </div>
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <label className="block text-14 font-semibold text-sivac-light">
              2. Nivel de Interacción con Estudiantes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1 */}
              <button
                type="button"
                onClick={() => setSelectedQ2("alto")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ2 === "alto"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">Alto (Interactúa seguido)</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ2 === "alto" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ2 === "alto" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>

              {/* Option 2 */}
              <button
                type="button"
                onClick={() => setSelectedQ2("medio")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ2 === "medio"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">Regular (Unidireccional)</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ2 === "medio" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ2 === "medio" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>

              {/* Option 3 */}
              <button
                type="button"
                onClick={() => setSelectedQ2("bajo")}
                className={`p-4 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selectedQ2 === "bajo"
                    ? "bg-sivac-blue/10 border-sivac-blue text-sivac-light"
                    : "bg-sivac-bg-input-admin border-sivac-border-card text-sivac-muted hover:border-sivac-muted"
                }`}
              >
                <span className="text-14 font-semibold">Bajo / Nulo</span>
                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedQ2 === "bajo" ? "border-sivac-blue" : "border-sivac-muted"
                }`}>
                  {selectedQ2 === "bajo" && <span className="w-2 h-2 rounded-full bg-sivac-blue" />}
                </span>
              </button>
            </div>
          </div>

          {/* Question 3 */}
          <div className="space-y-3">
            <label className="block text-14 font-semibold text-sivac-light">
              3. Detalle de Actividad Frecuente (Observaciones del Supervisor)
            </label>
            <textarea
              rows={4}
              placeholder="Describe las actividades realizadas por el docente, uso de material pedagógico, respuesta de los estudiantes, etc..."
              className="w-full p-4 bg-sivac-bg-input-admin border border-sivac-blue rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted shadow-inner font-normal"
            />
          </div>
        </div>
      </div>

      {/* Footer Wizard Actions */}
      <div className="flex items-center justify-between border-t border-sivac-border-card pt-6">
        <button
          type="button"
          className="h-[44px] px-6 bg-sivac-bg-secondary border border-sivac-border rounded-lg text-14 text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Paso Anterior</span>
        </button>

        <button
          type="button"
          className="h-[44px] px-6 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold shadow-lg shadow-sivac-blue/10 uppercase tracking-wide-06"
        >
          <span>Siguiente Paso</span>
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
