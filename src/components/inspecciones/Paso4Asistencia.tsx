import React from "react";
import { Info, AlertTriangle, Users, BookOpen } from "lucide-react";

interface Paso4FormData {
  alumnosAmbiente: number | "";
  alumnosIntranet: number | "";
  observacionesAsistencia: string;
}

interface Paso4AsistenciaProps {
  formData: Paso4FormData;
  updateFormData: (fields: Partial<Paso4FormData>) => void;
  modalidad: string;
}

export function Paso4Asistencia({ formData, updateFormData, modalidad }: Paso4AsistenciaProps) {
  const { alumnosAmbiente, alumnosIntranet, observacionesAsistencia } = formData;

  
  React.useEffect(() => {
    if (modalidad === "Virtual" && alumnosAmbiente !== "") {
      updateFormData({ alumnosAmbiente: "" });
    } else if (modalidad === "Presencial" && alumnosIntranet !== "") {
      updateFormData({ alumnosIntranet: "" });
    }
  }, [modalidad, alumnosAmbiente, alumnosIntranet, updateFormData]);

  
  const tieneDiferencia = 
    modalidad === "Híbrido" &&
    alumnosAmbiente !== "" && 
    alumnosIntranet !== "" && 
    Number(alumnosAmbiente) !== Number(alumnosIntranet);

  const diferencia = tieneDiferencia ? Math.abs(Number(alumnosAmbiente) - Number(alumnosIntranet)) : 0;

  return (
    <div className="space-y-6">
      {}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Control de Asistencia:</span> Cuenta la cantidad de estudiantes presentes físicamente en el laboratorio o aula y contrástalo con el reporte de marcación de asistencia de Intranet Docente.
        </div>
      </div>

      {}
      <div className="glass-card p-6 sm:p-8 space-y-6 rounded-xl bg-white/5 border border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {}
          <div className="space-y-2">
            <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
              <Users size={16} className="text-sivac-blue-light" />
              Alumnos en Ambiente (Físico)
              {modalidad === "Virtual" && (
                <span className="text-11 font-medium text-orange-400 normal-case">(No aplica en Virtual)</span>
              )}
            </label>
            <input
              type="number"
              min="0"
              disabled={modalidad === "Virtual"}
              value={modalidad === "Virtual" ? "" : alumnosAmbiente}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10));
                updateFormData({ alumnosAmbiente: val });
              }}
              placeholder={modalidad === "Virtual" ? "N/A" : "Ej. 28"}
              className={`w-full h-[46px] px-4 rounded-lg text-sivac-light text-14 outline-none transition-all ${
                modalidad === "Virtual"
                  ? "bg-white/5 border border-white/5 text-sivac-muted cursor-not-allowed"
                  : "bg-sivac-bg-input-admin border border-white/10 focus:border-sivac-blue placeholder:text-sivac-muted"
              }`}
            />
          </div>

          {}
          <div className="space-y-2">
            <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
              <BookOpen size={16} className="text-sivac-blue-light" />
              Alumnos en Intranet (Marcados)
              {modalidad === "Presencial" && (
                <span className="text-11 font-medium text-orange-400 normal-case">(No aplica en Presencial)</span>
              )}
            </label>
            <input
              type="number"
              min="0"
              disabled={modalidad === "Presencial"}
              value={modalidad === "Presencial" ? "" : alumnosIntranet}
              onChange={(e) => {
                const val = e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10));
                updateFormData({ alumnosIntranet: val });
              }}
              placeholder={modalidad === "Presencial" ? "N/A" : "Ej. 30"}
              className={`w-full h-[46px] px-4 rounded-lg text-sivac-light text-14 outline-none transition-all ${
                modalidad === "Presencial"
                  ? "bg-white/5 border border-white/5 text-sivac-muted cursor-not-allowed"
                  : "bg-sivac-bg-input-admin border border-white/10 focus:border-sivac-blue placeholder:text-sivac-muted"
              }`}
            />
          </div>

        </div>

        {}
        {tieneDiferencia && (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 flex gap-3 items-center animate-pulse">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div className="text-13 font-semibold">
              ⚠️ Diferencia de asistencia detectada: Existe una disparidad de {diferencia} {diferencia === 1 ? "estudiante" : "estudiantes"} entre lo presencial y lo registrado en intranet.
            </div>
          </div>
        )}

        {}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light">
            Observaciones de Asistencia (Opcional)
          </label>
          <textarea
            rows={3}
            value={observacionesAsistencia}
            onChange={(e) => updateFormData({ observacionesAsistencia: e.target.value })}
            placeholder="Ej. Algunos alumnos llegaron tarde y no alcanzaron a marcar en el portal..."
            className="w-full p-4 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted transition-colors font-normal shadow-inner"
          />
        </div>

      </div>
    </div>
  );
}
