import React from "react";
import { AlertCircle, Info, UserCheck, UserX, Clock, MessageSquare, HandHelping } from "lucide-react";

interface Paso2FormData {
  docentePresente: "Presente" | "Ausente" | "";
  horarioProgramado: "Puntual" | "Impuntual" | "";
  interaccion: "Interactúa" | "No Interactúa" | "";
  observacionesAusencia: string;
  actividadDocente: string;
}

interface Paso2ControlDocenteProps {
  formData: Paso2FormData;
  updateFormData: (fields: Partial<Paso2FormData>) => void;
}

export function Paso2ControlDocente({ formData, updateFormData }: Paso2ControlDocenteProps) {
  const {
    docentePresente,
    horarioProgramado,
    interaccion,
    observacionesAusencia,
    actividadDocente,
  } = formData;

  const esAusente = docentePresente === "Ausente";

  return (
    <div className="space-y-6">
      {}
      <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
        <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
        <div className="text-13 leading-relaxed">
          <span className="font-bold">Desarrollo de la sesión:</span> Observa el aula durante unos minutos para validar la interacción activa y la correspondencia con el horario asignado.
        </div>
      </div>

      {}
      <div
        className={`glass-card p-6 sm:p-8 space-y-6 transition-all duration-300 rounded-xl bg-white/5 border ${
          esAusente
            ? "border-red-500/80 shadow-lg shadow-red-500/5 bg-red-950/5"
            : "border-white/10"
        }`}
      >
        {}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
            <UserCheck size={16} className="text-sivac-blue-light" />
            1. Asistencia del Docente
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {}
            <button
              type="button"
              onClick={() => {
                updateFormData({
                  docentePresente: "Presente",
                  observacionesAusencia: ""
                });
              }}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                docentePresente === "Presente"
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light shadow-md shadow-sivac-blue/5"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck size={18} className={docentePresente === "Presente" ? "text-sivac-blue-light" : "text-sivac-dim"} />
                <span className="text-14 font-semibold">Presente</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                docentePresente === "Presente" ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {docentePresente === "Presente" && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>

            {}
            <button
              type="button"
              onClick={() => updateFormData({ docentePresente: "Ausente" })}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                docentePresente === "Ausente"
                  ? "bg-red-500/10 border-red-500 text-red-200 shadow-md shadow-red-500/5"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserX size={18} className={docentePresente === "Ausente" ? "text-red-400" : "text-sivac-dim"} />
                <span className="text-14 font-semibold">Ausente / No se presentó</span>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                docentePresente === "Ausente" ? "border-red-500" : "border-sivac-dim"
              }`}>
                {docentePresente === "Ausente" && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
              </div>
            </button>
          </div>
        </div>

        {}
        {esAusente && (
          <div className="space-y-3 p-4 rounded-lg bg-red-500/5 border border-red-500/25 animate-fadeIn">
            <label className="block text-13 font-semibold text-red-200 flex items-center gap-1.5">
              <AlertCircle size={14} className="text-red-400" />
              Especificar Motivo u Observaciones de la Ausencia (Obligatorio)
            </label>
            <textarea
              rows={3}
              value={observacionesAusencia}
              onChange={(e) => updateFormData({ observacionesAusencia: e.target.value })}
              placeholder="Detalla si el aula estaba vacía, si el delegado reportó alguna justificación o si se realizó algún otro descarte..."
              className="w-full p-3 bg-[#110707] border border-red-500/40 rounded-lg text-red-100 text-13 outline-none focus:border-red-500 placeholder:text-red-700 font-normal transition-colors"
              required
            />
          </div>
        )}

        {}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
            <Clock size={16} className="text-sivac-blue-light" />
            2. Horario Programado (Puntualidad)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {}
            <button
              type="button"
              disabled={esAusente}
              onClick={() => updateFormData({ horarioProgramado: "Puntual" })}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                esAusente ? "opacity-40 cursor-not-allowed border-white/5" : ""
              } ${
                horarioProgramado === "Puntual" && !esAusente
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <span className="text-14 font-semibold">Puntual</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                horarioProgramado === "Puntual" && !esAusente ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {horarioProgramado === "Puntual" && !esAusente && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>

            {}
            <button
              type="button"
              disabled={esAusente}
              onClick={() => updateFormData({ horarioProgramado: "Impuntual" })}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                esAusente ? "opacity-40 cursor-not-allowed border-white/5" : ""
              } ${
                horarioProgramado === "Impuntual" && !esAusente
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <span className="text-14 font-semibold">Impuntual / Con Retraso</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                horarioProgramado === "Impuntual" && !esAusente ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {horarioProgramado === "Impuntual" && !esAusente && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>
          </div>
        </div>

        {}
        <div className="space-y-3">
          <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
            <HandHelping size={16} className="text-sivac-blue-light" />
            3. Interacción en Clase
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {}
            <button
              type="button"
              disabled={esAusente}
              onClick={() => updateFormData({ interaccion: "Interactúa" })}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                esAusente ? "opacity-40 cursor-not-allowed border-white/5" : ""
              } ${
                interaccion === "Interactúa" && !esAusente
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <span className="text-14 font-semibold">Interactúa con los estudiantes</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                interaccion === "Interactúa" && !esAusente ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {interaccion === "Interactúa" && !esAusente && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>

            {}
            <button
              type="button"
              disabled={esAusente}
              onClick={() => updateFormData({ interaccion: "No Interactúa" })}
              className={`p-4 rounded-lg border text-left flex items-center justify-between transition-all duration-200 ${
                esAusente ? "opacity-40 cursor-not-allowed border-white/5" : ""
              } ${
                interaccion === "No Interactúa" && !esAusente
                  ? "bg-sivac-blue/15 border-sivac-blue text-sivac-light"
                  : "bg-sivac-bg-input-admin/60 border-white/10 text-sivac-muted hover:border-white/20"
              }`}
            >
              <span className="text-14 font-semibold">Clase Plana / Sin Interacción</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                interaccion === "No Interactúa" && !esAusente ? "border-sivac-blue" : "border-sivac-dim"
              }`}>
                {interaccion === "No Interactúa" && !esAusente && <div className="w-2.5 h-2.5 rounded-full bg-sivac-blue" />}
              </div>
            </button>
          </div>
        </div>

        {}
        {!esAusente && (
          <div className="space-y-3">
            <label className="block text-14 font-semibold text-sivac-light flex items-center gap-2">
              <MessageSquare size={16} className="text-sivac-blue-light" />
              Detalle de Actividad Observada
            </label>
            <textarea
              rows={4}
              value={actividadDocente}
              onChange={(e) => updateFormData({ actividadDocente: e.target.value })}
              placeholder="Ej. El docente expone la teoría del tema y organiza debates grupales..."
              className="w-full p-4 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-sivac-light text-14 outline-none focus:border-sivac-blue placeholder:text-sivac-muted transition-colors font-normal shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );
}
