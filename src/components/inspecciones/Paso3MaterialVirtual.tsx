import React from "react";
import { Info, CheckCircle, XCircle, MessageSquare, Cloud } from "lucide-react";

interface Paso3FormData {
  materialCargado: "CUMPLE" | "NO CUMPLE" | "";
  observacionesMaterial: string;
}

interface Paso3MaterialVirtualProps {
  formData: Paso3FormData;
  updateFormData: (fields: Partial<Paso3FormData>) => void;
}

export function Paso3MaterialVirtual({ formData, updateFormData }: Paso3MaterialVirtualProps) {
  const { materialCargado, observacionesMaterial } = formData;

  return (
    <div className="space-y-6">
      {/* Banner Informativo */}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Revisión del Aula Virtual (Canvas):</span> Ingresa a la plataforma y valida si el material correspondiente a la sesión actual (guías de laboratorio, diapositivas, recursos) fue publicado oportunamente antes de la hora de inicio de la clase.
        </div>
      </div>

      {/* Tarjeta Principal de Material Virtual */}
      <div className="glass-card p-6 sm:p-8 space-y-6 rounded-xl bg-white/5 border border-white/10">
        
        {/* Pregunta única: Estado del Material */}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
            <Cloud size={16} className="text-sivac-blue-light" />
            ¿El docente cargó los materiales a utilizar en el aula virtual antes del inicio de clases?
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opción Cumple */}
            <button
              type="button"
              onClick={() => updateFormData({ materialCargado: "CUMPLE" })}
              className={`p-5 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                materialCargado === "CUMPLE"
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light shadow-md shadow-sivac-blue/5"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className={materialCargado === "CUMPLE" ? "text-sivac-green-light" : "text-sivac-dim"} />
                <div>
                  <span className="block text-14 font-bold">CUMPLE</span>
                  <span className="block text-11 text-sivac-muted mt-0.5">Materiales publicados a tiempo.</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                materialCargado === "CUMPLE" ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {materialCargado === "CUMPLE" && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>

            {/* Opción No Cumple */}
            <button
              type="button"
              onClick={() => updateFormData({ materialCargado: "NO CUMPLE" })}
              className={`p-5 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                materialCargado === "NO CUMPLE"
                  ? "bg-red-500/10 border-red-500/80 text-red-200 shadow-md shadow-red-500/5"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <XCircle size={20} className={materialCargado === "NO CUMPLE" ? "text-red-400" : "text-sivac-dim"} />
                <div>
                  <span className="block text-14 font-bold">NO CUMPLE</span>
                  <span className="block text-11 text-sivac-muted mt-0.5">Faltan materiales o se subieron tarde.</span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                materialCargado === "NO CUMPLE" ? "border-red-500" : "border-sivac-dim"
              }`}>
                {materialCargado === "NO CUMPLE" && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* Campo Opcional: Observaciones */}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
            <MessageSquare size={16} className="text-sivac-blue-light" />
            Observaciones (Opcional)
          </label>
          <textarea
            rows={4}
            value={observacionesMaterial}
            onChange={(e) => updateFormData({ observacionesMaterial: e.target.value })}
            placeholder="Especifica detalles sobre los materiales revisados. Ej: Las diapositivas y guías de laboratorio se encuentran publicadas desde el inicio de la semana."
            className="w-full p-4 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted transition-colors font-normal shadow-inner"
          />
        </div>

      </div>
    </div>
  );
}
