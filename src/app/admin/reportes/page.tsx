"use client";

import React, { useState } from "react";
import { RefreshCw, Download, Printer, FileText } from "lucide-react";
import { FormatoVisitaUTP } from "@/components/Diseño/FormatoPDF/FormatoVisitaUTP";

export default function ReportesPage() {
  const [period, setPeriod] = useState("2026-i");
  const [sede, setSede] = useState("central");
  const [templateMode, setTemplateMode] = useState<"filled" | "empty">("filled");

  // Handler for printing
  const handlePrint = () => {
    window.print();
  };

  // Mock data tailored to user selections
  const getSedeName = (id: string) => {
    switch (id) {
      case "central":
        return "Sede Central - Lima";
      case "norte":
        return "Sede Norte - Los Olivos";
      case "sur":
        return "Sede Sur - Chorrillos";
      default:
        return "Red Nacional - UTP";
    }
  };

  const getDocenteName = (sedeId: string) => {
    switch (sedeId) {
      case "central":
        return "Dr. Ing. Hugo Cabrera Rojas";
      case "norte":
        return "Mag. Elena Valenzuela Soto";
      case "sur":
        return "Ing. Carlos Alberto Mendoza Ortiz";
      default:
        return "Docente Auditor Asignado";
    }
  };

  const getAsignatura = (sedeId: string) => {
    switch (sedeId) {
      case "central":
        return "Arquitectura de Software (12402)";
      case "norte":
        return "Ingeniería de Requerimientos (12405)";
      case "sur":
        return "Diseño y Patrones de Software (12410)";
      default:
        return "Desarrollo de Software Avanzado";
    }
  };

  // Generate audit data based on state
  const reportData = templateMode === "filled" ? {
    fechaVisita: "22/06/2026",
    horaInicio: "19:00",
    horaTermino: "20:30",
    sedeFilial: getSedeName(sede),
    ciclo: period === "2026-i" ? "2026-I" : period === "2025-ii" ? "2025-II" : "2025-I",
    turno: "Noche",
    asignatura: getAsignatura(sede),
    campoFormativo: "Ingeniería de Software / Tecnologías de la Información",
    semanaNo: "12",
    horaPracticaTeoria: "Teoría y Práctica Integrada",
    lugarVisita: "Aula B-402 (Laboratorio de Cómputo)",

    docenteNombre: getDocenteName(sede),
    docentePresente: "SI" as const,
    horarioProgramado: "Cumple" as const,
    interaccion: "SI" as const,
    actividad: "Exposición de patrones estructurales y desarrollo guiado de taller práctico en la nube.",
    obs1: "El docente inició sesión puntualmente y brindó soporte personalizado a los equipos de desarrollo.",

    materialCargado: "CUMPLE" as const,
    obs2: "Las diapositivas y el laboratorio práctico estaban subidos a la plataforma Canvas desde las 08:00 hrs del mismo día.",

    asistenciaAmbiente: "Cumple" as const,
    asistenciaAmbienteObs: "28 estudiantes presentes en laboratorio.",
    asistenciaIntranet: "Cumple" as const,
    asistenciaIntranetObs: "Asistencia registrada en portal docente.",
    obs3: "La lista de asistencia física concuerda plenamente con el reporte del sistema intranet.",

    silaboCoincide: "CUMPLE" as const,
    temaAnteriorCoincide: "CUMPLE" as const,
    ingresoSilaboVirtual: "CUMPLE" as const,
    obs4: "Avance temático según cronograma del sílabo oficial.",

    guiaPractica: "CUMPLE" as const,
    logroMedir: "CUMPLE" as const,
    rubricaEvaluacion: "CUMPLE" as const,
    obs5: "Se utilizó la rúbrica del laboratorio 3 cargada en Canvas. Los estudiantes mostraron dominio del logro planteado.",

    responsableActividad: "Mg. Luis Ernesto Quispe (Auditor Interno de Calidad)",
    requerimientosSolicitados: "Verificación de portafolio docente digital, silabo en físico y revisión del aula virtual en tiempo real.",
  } : {}; // Empty for manual filling

  return (
    <div className="space-y-8 font-inter">
      {/* Header Info (Hidden when printing) */}
      <div className="no-print">
        <h1 className="text-28 font-bold font-poppins text-sivac-light">
          Centro de Reportes
        </h1>
        <p className="text-14 font-normal text-sivac-body mt-1">
          Configura los filtros para generar, visualizar y descargar reportes oficiales de cumplimiento institucional.
        </p>
      </div>

      {/* Control Panel Card (Hidden when printing) */}
      <div className="admin-card p-6 space-y-6 no-print">
        <h3 className="text-16 font-bold text-sivac-light">
          Filtros del Reporte
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Dropdown 1: Periodo */}
          <div className="space-y-2">
            <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              Periodo Académico
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
            >
              <option value="2026-i">Ciclo 2026-I</option>
              <option value="2025-ii">Ciclo 2025-II</option>
              <option value="2025-i">Ciclo 2025-I</option>
            </select>
          </div>

          {/* Dropdown 2: Sede */}
          <div className="space-y-2">
            <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              Sede Académica
            </label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
            >
              <option value="central">Sede Central Lima</option>
              <option value="norte">Sede Norte Los Olivos</option>
              <option value="sur">Sede Sur Chorrillos</option>
            </select>
          </div>

          {/* Toggle 3: Plantilla vs Lleno */}
          <div className="space-y-2">
            <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              Tipo de Documento
            </label>
            <div className="flex h-[44px] rounded-lg border border-sivac-border-card p-1 bg-sivac-bg-input-admin">
              <button
                type="button"
                onClick={() => setTemplateMode("filled")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-12 font-bold transition-all ${
                  templateMode === "filled"
                    ? "bg-sivac-blue text-white"
                    : "text-sivac-muted hover:text-sivac-light"
                }`}
              >
                <FileText size={14} />
                <span>Reporte Lleno</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplateMode("empty")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md text-12 font-bold transition-all ${
                  templateMode === "empty"
                    ? "bg-sivac-blue text-white"
                    : "text-sivac-muted hover:text-sivac-light"
                }`}
              >
                <FileText size={14} />
                <span>Plantilla Vacía</span>
              </button>
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex items-end gap-3">
            <button
              type="button"
              className="flex-1 h-[44px] bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors font-bold uppercase tracking-wide-06 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} strokeWidth={2.5} />
              <span>Actualizar</span>
            </button>
            <button
              type="button"
              className="h-[44px] px-3 border border-sivac-border-card hover:bg-sivac-bg-secondary/40 text-sivac-body hover:text-sivac-heading rounded-lg transition-colors flex items-center justify-center"
              title="Descargar en formato CSV"
            >
              <Download size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-18 font-bold text-sivac-light">
            Vista Previa del Formato Oficial UTP
          </h2>
          <button
            type="button"
            onClick={handlePrint}
            className="text-13 text-sivac-indigo hover:text-sivac-heading font-semibold flex items-center gap-1.5 transition-colors border border-sivac-border-card hover:bg-sivac-bg-secondary/20 px-3 py-1.5 rounded-lg"
          >
            <Printer size={16} strokeWidth={2} />
            <span>Imprimir Formato</span>
          </button>
        </div>

        {/* Paper Container (White container simulating A4 sheet on web UI) */}
        <div className="bg-gray-100 p-4 sm:p-8 rounded-xl border border-sivac-border-card flex justify-center overflow-auto print:bg-white print:p-0 print:border-0">
          <FormatoVisitaUTP {...reportData} />
        </div>
      </div>
    </div>
  );
}
