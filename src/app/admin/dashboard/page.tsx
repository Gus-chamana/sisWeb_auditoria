"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Download,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 font-inter">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-heading tracking-tight">
            Dashboard de Supervisión
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Resumen ejecutivo del estado de las auditorías académicas y visitas en curso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Button */}
          <button
            type="button"
            className="h-[40px] px-4 bg-sivac-bg-secondary border border-sivac-border rounded-lg text-14 font-medium text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors flex items-center gap-2"
          >
            <Calendar size={16} strokeWidth={2} className="text-sivac-muted" />
            <span>Periodo: Ciclo 2026-I</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            className="h-[40px] px-4 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06"
          >
            <Download size={16} strokeWidth={2.5} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Visitas Hoy */}
        <div className="admin-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden group hover:border-sivac-blue/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              VISITAS HOY
            </span>
            <div className="p-2 rounded-lg bg-sivac-blue/10 text-sivac-blue">
              <Users size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-poppins text-48 font-bold text-sivac-heading leading-none">
              12
            </span>
            <span className="text-12 font-semibold text-sivac-green-soft">
              +8% vs. ayer
            </span>
          </div>
        </div>

        {/* Card 2: Visitas Pendientes */}
        <div className="admin-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden group hover:border-sivac-blue/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              VISITAS PENDIENTES
            </span>
            <div className="p-2 rounded-lg bg-sivac-yellow/10 text-sivac-yellow">
              <Clock size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-poppins text-48 font-bold text-sivac-heading leading-none">
              45
            </span>
            <span className="text-12 font-semibold text-sivac-red-soft">
              -3% vs. mes pas.
            </span>
          </div>
        </div>

        {/* Card 3: Auditorías Finalizadas */}
        <div className="admin-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden group hover:border-sivac-blue/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              AUDITORÍAS FINALIZADAS
            </span>
            <div className="p-2 rounded-lg bg-sivac-green-soft/10 text-sivac-green-soft">
              <CheckCircle2 size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-poppins text-48 font-bold text-sivac-heading leading-none">
              128
            </span>
            <span className="text-12 font-semibold text-sivac-indigo">
              75% total red
            </span>
          </div>
        </div>

        {/* Card 4: Alertas Activas */}
        <div className="admin-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden group hover:border-sivac-blue/30 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              ALERTAS ACTIVAS
            </span>
            <div className="p-2 rounded-lg bg-sivac-red/10 text-sivac-red">
              <AlertTriangle size={18} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-poppins text-48 font-bold text-sivac-heading leading-none">
              3
            </span>
            <div className="flex flex-col text-right text-12 font-semibold">
              <span className="text-sivac-red-soft">1 Crítica</span>
              <span className="text-sivac-yellow mt-0.5">2 Medias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cumplimiento por Sede + Docentes Observados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cumplimiento por Sede (Bar Chart) */}
          <div className="admin-card p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-16 font-bold text-sivac-heading">
                  Cumplimiento por Sede
                </h3>
                <p className="text-12 font-normal text-sivac-muted mt-0.5">
                  Porcentaje de estándares académicos aprobados por sede evaluada.
                </p>
              </div>
              <span className="text-12 font-semibold text-sivac-indigo bg-sivac-blue/10 px-2.5 py-1 rounded">
                Ciclo Actual
              </span>
            </div>

            {/* Vertical Bar Chart (CSS Puro) */}
            <div className="h-[200px] flex items-end justify-between pt-4 px-4 border-b border-sivac-border-card">
              {/* Norte 85% */}
              <div className="flex flex-col items-center w-1/5 group">
                <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  85%
                </span>
                <div
                  className="w-8 sm:w-12 bg-sivac-blue rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer"
                  style={{ height: "170px" }}
                />
                <span className="text-12 font-medium text-sivac-muted mt-3">Norte</span>
              </div>
              {/* Sur 65% */}
              <div className="flex flex-col items-center w-1/5 group">
                <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  65%
                </span>
                <div
                  className="w-8 sm:w-12 bg-sivac-blue/80 rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer"
                  style={{ height: "130px" }}
                />
                <span className="text-12 font-medium text-sivac-muted mt-3">Sur</span>
              </div>
              {/* Centro 92% */}
              <div className="flex flex-col items-center w-1/5 group">
                <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  92%
                </span>
                <div
                  className="w-8 sm:w-12 bg-sivac-green-soft rounded-t transition-all duration-500 hover:bg-[#5bebb2] cursor-pointer"
                  style={{ height: "184px" }}
                />
                <span className="text-12 font-medium text-sivac-muted mt-3">Centro</span>
              </div>
              {/* Este 45% */}
              <div className="flex flex-col items-center w-1/5 group">
                <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  45%
                </span>
                <div
                  className="w-8 sm:w-12 bg-sivac-red-soft rounded-t transition-all duration-500 hover:bg-[#ffc1b8] cursor-pointer"
                  style={{ height: "90px" }}
                />
                <span className="text-12 font-medium text-sivac-muted mt-3">Este</span>
              </div>
              {/* Oeste 78% */}
              <div className="flex flex-col items-center w-1/5 group">
                <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                  78%
                </span>
                <div
                  className="w-8 sm:w-12 bg-sivac-blue/90 rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer"
                  style={{ height: "156px" }}
                />
                <span className="text-12 font-medium text-sivac-muted mt-3">Oeste</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estado de Visitas (Donut Chart SVG) */}
            <div className="admin-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-16 font-bold text-sivac-heading">
                  Estado de Visitas
                </h3>
                <p className="text-12 font-normal text-sivac-muted mt-0.5 mb-6">
                  Distribución total de visitas registradas.
                </p>
              </div>

              <div className="flex items-center justify-around">
                {/* SVG Donut */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#111827"
                      strokeWidth="3.2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#22c55e"
                      strokeWidth="3.2"
                      strokeDasharray="69 31"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#eab308"
                      strokeWidth="3.2"
                      strokeDasharray="24 76"
                      strokeDashoffset="-69"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="3.2"
                      strokeDasharray="7 93"
                      strokeDashoffset="-93"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-20 font-bold text-sivac-heading">185</span>
                    <span className="text-10 font-bold text-sivac-muted uppercase tracking-wider">Total</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                    <div className="text-12">
                      <p className="text-sivac-heading font-semibold leading-none">128</p>
                      <p className="text-sivac-muted leading-none mt-1 font-normal">Finalizadas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <div className="text-12">
                      <p className="text-sivac-heading font-semibold leading-none">45</p>
                      <p className="text-sivac-muted leading-none mt-1 font-normal">En Curso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <div className="text-12">
                      <p className="text-sivac-heading font-semibold leading-none">12</p>
                      <p className="text-sivac-muted leading-none mt-1 font-normal">Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Docentes Observados (Horizontal Bar Chart) */}
            <div className="admin-card p-6">
              <h3 className="text-16 font-bold text-sivac-heading mb-1">
                Docentes Observados
              </h3>
              <p className="text-12 font-normal text-sivac-muted mb-6">
                Número de docentes con observaciones por área.
              </p>

              <div className="space-y-4">
                {/* Matemáticas (42) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-12 font-medium">
                    <span className="text-sivac-heading">Matemáticas</span>
                    <span className="text-sivac-muted">42</span>
                  </div>
                  <div className="h-2 bg-sivac-bg-input-admin rounded-full overflow-hidden">
                    <div className="h-full bg-sivac-blue rounded-full" style={{ width: "84%" }} />
                  </div>
                </div>

                {/* Ciencias (35) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-12 font-medium">
                    <span className="text-sivac-heading">Ciencias</span>
                    <span className="text-sivac-muted">35</span>
                  </div>
                  <div className="h-2 bg-sivac-bg-input-admin rounded-full overflow-hidden">
                    <div className="h-full bg-sivac-blue rounded-full" style={{ width: "70%" }} />
                  </div>
                </div>

                {/* Lenguaje (28) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-12 font-medium">
                    <span className="text-sivac-heading">Lenguaje</span>
                    <span className="text-sivac-muted">28</span>
                  </div>
                  <div className="h-2 bg-sivac-bg-input-admin rounded-full overflow-hidden">
                    <div className="h-full bg-sivac-blue rounded-full" style={{ width: "56%" }} />
                  </div>
                </div>

                {/* Historia (15) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-12 font-medium">
                    <span className="text-sivac-heading">Historia</span>
                    <span className="text-sivac-muted">15</span>
                  </div>
                  <div className="h-2 bg-sivac-bg-input-admin rounded-full overflow-hidden">
                    <div className="h-full bg-sivac-blue rounded-full" style={{ width: "30%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Timeline Actividad Reciente */}
        <div className="admin-card p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-16 font-bold text-sivac-heading">
              Actividad Reciente
            </h3>
            <p className="text-12 font-normal text-sivac-muted mt-0.5">
              Últimos eventos registrados en la red académica.
            </p>
          </div>

          {/* Timeline */}
          <div className="flex-1 relative border-l border-sivac-border-card ml-2.5 space-y-6 pb-2">
            {/* Event 1 */}
            <div className="relative pl-6 group">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-sivac-green border-2 border-sivac-bg-card transition-transform group-hover:scale-125" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="green">Visita finalizada</Badge>
                  <span className="text-12 font-medium text-sivac-dim">Hace 10 min</span>
                </div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Auditoría Sede Norte Completada
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-1">
                  Supervisora: Ana Martínez. Puntuación: 92/100
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative pl-6 group">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-sivac-blue border-2 border-sivac-bg-card transition-transform group-hover:scale-125" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="blue">PDF generado</Badge>
                  <span className="text-12 font-medium text-sivac-dim">Hace 45 min</span>
                </div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Reporte Mensual Octubre
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-1">
                  Enviado a directores de la red nacional.
                </p>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 text-12 text-sivac-indigo hover:text-sivac-heading font-medium mt-2.5 transition-colors"
                >
                  <Download size={13} strokeWidth={2} />
                  <span>Descargar Documento</span>
                </a>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative pl-6 group">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-sivac-yellow border-2 border-sivac-bg-card transition-transform group-hover:scale-125" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="yellow">Nueva auditoría</Badge>
                  <span className="text-12 font-medium text-sivac-dim">Hace 2 horas</span>
                </div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Asignación: Sede Sur
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-1">
                  Auditoría sorpresa programada para el 15 de Nov.
                </p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="relative pl-6 group">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-sivac-muted border-2 border-sivac-bg-card transition-transform group-hover:scale-125" />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="gray">Sincronización</Badge>
                  <span className="text-12 font-medium text-sivac-dim">Ayer 23:00</span>
                </div>
                <h4 className="text-14 font-semibold text-sivac-heading">
                  Base de datos central
                </h4>
                <p className="text-12 font-normal text-sivac-body mt-1">
                  142 registros actualizados desde terminales locales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
