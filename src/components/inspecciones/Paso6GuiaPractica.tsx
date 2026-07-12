import React from "react";
import { Info, Check, X, Ban, HelpCircle, FileText } from "lucide-react";

interface Paso6FormData {
  guiaPractica: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  logroMedir: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  rubricaEvaluacion: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  observacionesGuia: string;
}

interface Paso6GuiaPracticaProps {
  formData: Paso6FormData;
  updateFormData: (fields: Partial<Paso6FormData>) => void;
}

export function Paso6GuiaPractica({ formData, updateFormData }: Paso6GuiaPracticaProps) {
  const { guiaPractica, logroMedir, rubricaEvaluacion, observacionesGuia } = formData;

  const items = [
    {
      id: "guiaPractica" as const,
      label: "1. ¿Cumple con el tema programado en la guía de práctica para el desarrollo de la sesión?",
      description: "Verifica si las consignas, ejercicios o experimentos corresponden con la guía de práctica oficial.",
      value: guiaPractica
    },
    {
      id: "logroMedir" as const,
      label: "2. ¿Se evidencia el logro a medir en la práctica desarrollada?",
      description: "Revisa si la sesión está estructurada para alcanzar y evaluar el logro de aprendizaje específico.",
      value: logroMedir
    },
    {
      id: "rubricaEvaluacion" as const,
      label: "3. ¿Cuenta con una rúbrica de evaluación clara y compartida?",
      description: "Confirma si los estudiantes conocen los criterios de evaluación y si están publicados en Canvas.",
      value: rubricaEvaluacion
    }
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Desarrollo de la Guía de Práctica:</span> Evalúa la aplicación de metodologías activas y el cumplimiento de las guías de laboratorio o talleres prácticos durante la visita.
        </div>
      </div>

      {}
      <div className="glass-card p-6 sm:p-8 space-y-6 rounded-xl bg-white/5 border border-white/10">
        
        {}
        <div className="space-y-6 divide-y divide-white/5">
          {items.map((item, idx) => (
            <div key={item.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""} space-y-3`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-14 font-semibold text-sivac-light flex items-start gap-2">
                    <FileText size={16} className="text-sivac-blue-light shrink-0 mt-0.5" />
                    {item.label}
                  </h4>
                  <p className="text-11 text-sivac-muted ml-6 max-w-xl">{item.description}</p>
                </div>

                {}
                <div className="flex bg-sivac-bg-input-admin/60 border border-white/10 p-0.5 rounded-lg w-full lg:w-[320px] shrink-0">
                  {}
                  <button
                    type="button"
                    onClick={() => updateFormData({ [item.id]: "CUMPLE" })}
                    className={`flex-1 h-8 flex items-center justify-center gap-1 text-11 font-bold rounded transition-all ${
                      item.value === "CUMPLE"
                        ? "bg-sivac-blue text-white shadow"
                        : "text-sivac-muted hover:text-sivac-light"
                    }`}
                  >
                    <Check size={13} />
                    <span>Cumple</span>
                  </button>

                  {}
                  <button
                    type="button"
                    onClick={() => updateFormData({ [item.id]: "NO CUMPLE" })}
                    className={`flex-1 h-8 flex items-center justify-center gap-1 text-11 font-bold rounded transition-all ${
                      item.value === "NO CUMPLE"
                        ? "bg-red-500/20 text-red-200 border border-red-500/30"
                        : "text-sivac-muted hover:text-sivac-light"
                    }`}
                  >
                    <X size={13} />
                    <span>No Cumple</span>
                  </button>

                  {}
                  <button
                    type="button"
                    onClick={() => updateFormData({ [item.id]: "NO APLICA" })}
                    className={`flex-1 h-8 flex items-center justify-center gap-1 text-11 font-bold rounded transition-all ${
                      item.value === "NO APLICA"
                        ? "bg-white/10 text-sivac-light border border-white/20"
                        : "text-sivac-muted hover:text-sivac-light"
                    }`}
                  >
                    <Ban size={13} />
                    <span>N/A</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="space-y-3 border-t border-white/5 pt-6">
          <label className="block text-14 font-semibold text-sivac-light">
            Observaciones de la Actividad Práctica (Opcional)
          </label>
          <textarea
            rows={3}
            value={observacionesGuia}
            onChange={(e) => updateFormData({ observacionesGuia: e.target.value })}
            placeholder="Ej. Se verificó el uso de la Guía de Laboratorio N° 4 en todos los grupos..."
            className="w-full p-4 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted transition-colors font-normal shadow-inner"
          />
        </div>

      </div>
    </div>
  );
}
