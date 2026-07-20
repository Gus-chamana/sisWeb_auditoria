import React from "react";
import { Info, BookOpen, Check, X, FileSearch } from "lucide-react";

interface Paso5FormData {
  silaboCoincide: "CUMPLE" | "NO CUMPLE" | "";
  temaAnteriorCoincide: "CUMPLE" | "NO CUMPLE" | "";
  ingresoSilaboVirtual: "CUMPLE" | "NO CUMPLE" | "";
  observacionesSilabo: string;
}

interface Paso5AvanceSilabicoProps {
  formData: Paso5FormData;
  updateFormData: (fields: Partial<Paso5FormData>) => void;
}

export function Paso5AvanceSilabico({ formData, updateFormData }: Paso5AvanceSilabicoProps) {
  const { silaboCoincide, temaAnteriorCoincide, ingresoSilaboVirtual, observacionesSilabo } = formData;

  const items = [
    {
      id: "silaboCoincide" as const,
      label: "1. ¿El tema desarrollado coincide con la clase correspondiente programada para hoy?",
      description: "Contrasta el contenido impartido hoy con el cronograma del sílabo oficial de la asignatura.",
      value: silaboCoincide
    },
    {
      id: "temaAnteriorCoincide" as const,
      label: "2. ¿El tema desarrollado en la sesión anterior coincidió con lo programado?",
      description: "Verifica en la bitácora o cuaderno de clases si el tema anterior siguió la secuencia programada.",
      value: temaAnteriorCoincide
    },
    {
      id: "ingresoSilaboVirtual" as const,
      label: "3. ¿El docente ingresó el avance de sílabo en el aula virtual de aprendizaje?",
      description: "Valida si el docente registró la bitácora del avance semanal en el portal de clases.",
      value: ingresoSilaboVirtual
    }
  ];

  return (
    <div className="space-y-6">
      {}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Verificación de Avance Silábico:</span> Compara la agenda temática descrita en el sílabo de la materia con el material presentado en clase por el docente para certificar que el cronograma académico está al día.
        </div>
      </div>

      {}
      <div className="glass-card p-6 sm:p-8 space-y-6 rounded-xl bg-sivac-bg-surface border border-sivac-border-card">
        
        {}
        <div className="space-y-6 divide-y divide-white/5">
          {items.map((item, idx) => (
            <div key={item.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""} space-y-3`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-14 font-semibold text-sivac-light flex items-start gap-2">
                    <FileSearch size={16} className="text-sivac-blue-light shrink-0 mt-0.5" />
                    {item.label}
                  </h4>
                  <p className="text-11 text-sivac-muted ml-6 max-w-xl">{item.description}</p>
                </div>

                {}
                <div className="flex bg-sivac-bg-input-admin border border-sivac-border/50 p-0.5 rounded-lg w-full md:w-[240px] shrink-0">
                  <button
                    type="button"
                    onClick={() => updateFormData({ [item.id]: "CUMPLE" })}
                    className={`flex-1 h-8 flex items-center justify-center gap-1 text-12 font-bold rounded transition-all ${
                      item.value === "CUMPLE"
                        ? "bg-sivac-blue text-white shadow"
                        : "text-sivac-muted hover:text-sivac-light"
                    }`}
                  >
                    <Check size={14} />
                    <span>Cumple</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFormData({ [item.id]: "NO CUMPLE" })}
                    className={`flex-1 h-8 flex items-center justify-center gap-1 text-12 font-bold rounded transition-all ${
                      item.value === "NO CUMPLE"
                        ? "bg-red-500/20 text-red-200 border border-red-500/30"
                        : "text-sivac-muted hover:text-sivac-light"
                    }`}
                  >
                    <X size={14} />
                    <span>No Cumple</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {}
        <div className="space-y-3 border-t border-white/5 pt-6">
          <label className="block text-14 font-semibold text-sivac-light">
            Observaciones Adicionales (Opcional)
          </label>
          <textarea
            rows={3}
            value={observacionesSilabo}
            onChange={(e) => updateFormData({ observacionesSilabo: e.target.value })}
            placeholder="Ej. El avance de sílabo coincide plenamente; sin embargo, se recomienda mayor detalle en la descripción de las herramientas utilizadas..."
            className="w-full p-4 bg-sivac-bg-input-admin border border-sivac-border/50 rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted transition-colors font-normal shadow-inner"
          />
        </div>

      </div>
    </div>
  );
}
