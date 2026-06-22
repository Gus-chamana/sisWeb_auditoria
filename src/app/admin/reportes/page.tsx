"use client";

import React, { useState } from "react";
import { RefreshCw, Download, Printer } from "lucide-react";

export default function ReportesPage() {
  const [period, setPeriod] = useState("2026-i");
  const [sede, setSede] = useState("todas");

  return (
    <div className="space-y-8 font-inter">
      {/* Header Info */}
      <div>
        <h1 className="text-28 font-bold font-poppins text-sivac-light">
          Centro de Reportes
        </h1>
        <p className="text-14 font-normal text-sivac-body mt-1">
          Configura los filtros para generar, visualizar y descargar reportes oficiales de cumplimiento institucional.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="admin-card p-6 space-y-6">
        <h3 className="text-16 font-bold text-sivac-light">
          Filtros del Reporte
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              <option value="todas">Todas las sedes</option>
              <option value="central">Sede Central Lima</option>
              <option value="norte">Sede Norte Los Olivos</option>
              <option value="sur">Sede Sur Chorrillos</option>
            </select>
          </div>

          {/* Action Buttons Container */}
          <div className="flex items-end gap-3">
            <button
              type="button"
              className="flex-1 h-[44px] bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors font-bold uppercase tracking-wide-06 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} strokeWidth={2.5} />
              <span>Generar</span>
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
        <div className="flex justify-between items-center">
          <h2 className="text-18 font-bold text-sivac-light">
            Vista Previa del Documento
          </h2>
          <button
            type="button"
            className="text-13 text-sivac-indigo hover:text-sivac-heading font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer size={16} strokeWidth={2} />
            <span>Imprimir Reporte</span>
          </button>
        </div>

        {/* PDF Style Preview Box (White Background) */}
        <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-12 text-gray-900 border border-gray-200 min-h-[600px] flex flex-col justify-between max-w-4xl mx-auto font-sans">
          {/* PDF Header */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6">
            <div>
              <p className="text-12 font-bold tracking-widest text-blue-800 uppercase">
                SIVAC SYSTEM
              </p>
              <h2 className="text-22 font-extrabold tracking-tight mt-1">
                REPORTE DE CUMPLIMIENTO ACADÉMICO
              </h2>
              <p className="text-12 text-gray-500 mt-1">
                Generado automáticamente por la Plataforma de Auditoría
              </p>
            </div>
            {/* Mock Logo Box */}
            <div className="w-14 h-14 bg-gray-100 rounded border border-gray-300 flex items-center justify-center font-bold text-gray-400 text-12 text-center uppercase p-1">
              LOGO INST.
            </div>
          </div>

          {/* PDF Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-13 my-6 border-b border-gray-100 pb-4">
            <div>
              <p className="text-gray-500">Periodo Académico:</p>
              <p className="font-bold text-gray-800 uppercase">{period === "2026-i" ? "Ciclo 2026-I" : period === "2025-ii" ? "Ciclo 2025-II" : "Ciclo 2025-I"}</p>
            </div>
            <div>
              <p className="text-gray-500">Sede Evaluada:</p>
              <p className="font-bold text-gray-800 uppercase">{sede === "todas" ? "Todas las sedes (Red Nacional)" : sede === "central" ? "Sede Central Lima" : sede === "norte" ? "Sede Norte Los Olivos" : "Sede Sur Chorrillos"}</p>
            </div>
            <div>
              <p className="text-gray-500">Fecha de Generación:</p>
              <p className="font-bold text-gray-800">14/05/2026</p>
            </div>
            <div>
              <p className="text-gray-500">Estado General:</p>
              <p className="font-bold text-green-700">COMPLETADO (94.2%)</p>
            </div>
          </div>

          {/* PDF Report Body Content */}
          <div className="flex-1 space-y-6">
            <div>
              <h4 className="text-14 font-bold text-gray-800 uppercase tracking-wider mb-2">
                1. Resumen Ejecutivo
              </h4>
              <p className="text-13 text-gray-600 leading-relaxed">
                Durante el ciclo académico evaluado, se ha procedido con la inspección en aula de los docentes asignados en la muestra aleatoria institucional. El índice promedio de cumplimiento general alcanza el <span className="font-bold text-gray-800">94.2%</span>, lo cual representa una mejora progresiva del <span className="font-bold text-gray-800">2.1%</span> frente a los periodos evaluados anteriormente.
              </p>
            </div>

            <div>
              <h4 className="text-14 font-bold text-gray-800 uppercase tracking-wider mb-2">
                2. Tabla de Indicadores Clave
              </h4>
              <table className="w-full text-left text-12 border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-150 border-b border-gray-300">
                    <th className="py-2 px-3 font-bold text-gray-700">Sede</th>
                    <th className="py-2 px-3 font-bold text-gray-700 text-center">Visitas Programadas</th>
                    <th className="py-2 px-3 font-bold text-gray-700 text-center">Completadas</th>
                    <th className="py-2 px-3 font-bold text-gray-700 text-right">Índice Aprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2 px-3 text-gray-800 font-semibold">Sede Central</td>
                    <td className="py-2 px-3 text-center text-gray-600">45</td>
                    <td className="py-2 px-3 text-center text-gray-600">42</td>
                    <td className="py-2 px-3 text-right font-bold text-green-600">92.0%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-800 font-semibold">Sede Norte</td>
                    <td className="py-2 px-3 text-center text-gray-600">30</td>
                    <td className="py-2 px-3 text-center text-gray-600">28</td>
                    <td className="py-2 px-3 text-right font-bold text-green-600">85.0%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-800 font-semibold">Sede Sur</td>
                    <td className="py-2 px-3 text-center text-gray-600">25</td>
                    <td className="py-2 px-3 text-center text-gray-600">20</td>
                    <td className="py-2 px-3 text-right font-bold text-green-600">95.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PDF Signature / Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8 flex justify-between items-center text-11 text-gray-400">
            <p>© 2026 SIVAC. Todos los derechos reservados.</p>
            <p>Página 1 de 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
