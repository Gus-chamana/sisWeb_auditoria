"use client";

import React from "react";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";

export default function AnalyticsPage() {
  return (
    <AccessGuard allowedRoles={["Admin", "Auditor"]}>
      <div className="space-y-8 font-inter">
      {/* Header Info */}
      <div>
        <h1 className="text-28 font-bold font-poppins text-sivac-light">
          Analytics
        </h1>
        <p className="text-14 font-normal text-sivac-body mt-1">
          Vista ejecutiva de métricas históricas, índices de cumplimiento y tendencias del sistema.
        </p>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1: Cumplimiento Promedio */}
        <div className="admin-card p-6 border-l-4 border-l-sivac-blue hover:border-sivac-blue/30 transition-all flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              CUMPLIMIENTO PROMEDIO
            </span>
            <div className="text-sivac-blue p-1 bg-sivac-blue/5 rounded">
              <TrendingUp size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-36 font-bold text-sivac-light leading-none">
              94.2%
            </p>
            <p className="text-12 font-semibold text-sivac-green-soft mt-1">
              ↑ Subió 2.1% este mes
            </p>
          </div>
        </div>

        {/* Stat Card 2: Visitas Finalizadas */}
        <div className="admin-card p-6 border-l-4 border-l-sivac-border-card hover:border-sivac-blue/30 transition-all flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              VISITAS FINALIZADAS
            </span>
            <div className="text-sivac-muted p-1 bg-sivac-bg-secondary rounded">
              <Award size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-36 font-bold text-sivac-light leading-none">
              14,204
            </p>
            <p className="text-12 font-medium text-sivac-muted mt-1">
              En toda la red nacional
            </p>
          </div>
        </div>

        {/* Stat Card 3: Auditorías Observadas */}
        <div className="admin-card p-6 border-l-4 border-l-sivac-yellow hover:border-sivac-blue/30 transition-all flex flex-col justify-between h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              AUDITORÍAS OBSERVADAS
            </span>
            <div className="text-sivac-yellow p-1 bg-sivac-yellow/5 rounded">
              <AlertCircle size={16} strokeWidth={2} />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-36 font-bold text-sivac-yellow leading-none">
              12
            </p>
            <p className="text-12 font-medium text-sivac-muted mt-1">
              Requieren revisión manual inmediata
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempeño Mensual (Bar Chart) */}
        <div className="admin-card p-6">
          <div className="mb-6">
            <h3 className="text-16 font-bold text-sivac-heading">
              Desempeño Mensual
            </h3>
            <p className="text-12 font-normal text-sivac-muted mt-0.5">
              Variación promedio de cumplimiento de estándares de los últimos meses.
            </p>
          </div>

          {/* Bar Chart CSS */}
          <div className="h-[240px] flex items-end justify-around border-b border-sivac-border-card px-4 pt-6">
            {/* Agosto */}
            <div className="flex flex-col items-center w-12 group">
              <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                88%
              </span>
              <div className="w-10 bg-sivac-blue rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer h-[176px]" />
              <span className="text-12 text-sivac-muted mt-3">Ago</span>
            </div>

            {/* Septiembre */}
            <div className="flex flex-col items-center w-12 group">
              <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                90%
              </span>
              <div className="w-10 bg-sivac-blue rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer h-[180px]" />
              <span className="text-12 text-sivac-muted mt-3">Sep</span>
            </div>

            {/* Octubre */}
            <div className="flex flex-col items-center w-12 group">
              <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                92%
              </span>
              <div className="w-10 bg-sivac-blue rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer h-[184px]" />
              <span className="text-12 text-sivac-muted mt-3">Oct</span>
            </div>

            {/* Noviembre (Actual) */}
            <div className="flex flex-col items-center w-12 group">
              <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                94%
              </span>
              <div className="w-10 bg-sivac-indigo rounded-t transition-all duration-500 hover:bg-sivac-indigo-light cursor-pointer h-[188px]" />
              <span className="text-12 text-sivac-indigo mt-3 font-semibold">Nov</span>
            </div>
          </div>
        </div>

        {/* Alertas por Sede (Donut Chart) */}
        <div className="admin-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-16 font-bold text-sivac-heading">
              Alertas por Sede
            </h3>
            <p className="text-12 font-normal text-sivac-muted mt-0.5 mb-6">
              Distribución porcentual de alertas críticas y medias detectadas.
            </p>
          </div>

          <div className="flex items-center justify-around my-auto">
            {/* Donut SVG */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#111827"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth="3.5"
                  strokeDasharray="12 88"
                  strokeDashoffset="0"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#374151"
                  strokeWidth="3.5"
                  strokeDasharray="88 12"
                  strokeDashoffset="-12"
                />
              </svg>
              {/* Center Info text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-22 font-bold text-sivac-yellow">12%</span>
                <span className="text-10 font-bold text-sivac-muted uppercase tracking-wider">Alertas</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded bg-sivac-yellow" />
                <div>
                  <p className="text-14 font-semibold text-sivac-heading">Alertas Activas</p>
                  <p className="text-12 text-sivac-muted">12% del total de visitas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded bg-sivac-border-card" />
                <div>
                  <p className="text-14 font-semibold text-sivac-heading">Sin Observaciones</p>
                  <p className="text-12 text-sivac-muted">88% visitas óptimas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AccessGuard>
  );
}
