"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Award, AlertCircle, Loader2 } from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";
import { createClient } from "@/utils/supabase/client";

interface VisitData {
  id: number;
  fecha_visita: string;
  estado_id: number;
  sede_id: number;
  evidencias_fotos?: { id: number }[];
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<VisitData[]>([]);

  const getEffectiveEstadoId = (v: VisitData) => {
    if (v.estado_id === 3 || v.estado_id === 4) {
      const hasEvidence = v.evidencias_fotos && v.evidencias_fotos.length > 0;
      return hasEvidence ? 3 : 4;
    }
    return v.estado_id;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("visitas")
          .select("id, fecha_visita, estado_id, sede_id, evidencias_fotos(id)")
          .is("deleted_at", null);

        if (error) console.error("Error loading visits for analytics:", error);
        else if (data) setVisits(data as any);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // --- Computations ---
  const totalVisits = visits.length;
  const visitsCompleted = visits.filter(v => getEffectiveEstadoId(v) === 3).length;
  const visitsObservadas = visits.filter(v => getEffectiveEstadoId(v) === 4).length;

  // CUMPLIMIENTO PROMEDIO
  const complianceAverage = totalVisits > 0 ? Math.round((visitsCompleted / totalVisits) * 1000) / 10 : 0;

  // Monthly performance calculations (we calculate for the last 4 months: Mar, Apr, May, Jun 2026)
  const getMonthlyStats = () => {
    const months = [
      { key: "03", name: "Mar" },
      { key: "04", name: "Abr" },
      { key: "05", name: "May" },
      { key: "06", name: "Jun" }
    ];

    return months.map(m => {
      const monthVisits = visits.filter(v => {
        if (!v.fecha_visita) return false;
        const [year, month] = v.fecha_visita.split("-");
        return month === m.key && year === "2026";
      });

      const total = monthVisits.length;
      const completed = monthVisits.filter(v => getEffectiveEstadoId(v) === 3).length;
      const compliance = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: m.name,
        compliance,
        total
      };
    });
  };

  const monthlyStats = getMonthlyStats();

  // Donut chart: Alertas por Sede
  const pctAlertas = totalVisits > 0 ? Math.round((visitsObservadas / totalVisits) * 100) : 0;
  const pctOptimas = totalVisits > 0 ? 100 - pctAlertas : 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-sivac-blue animate-spin" />
          <p className="text-14 text-sivac-muted">Cargando análisis métricos...</p>
        </div>
      </div>
    );
  }

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
                {complianceAverage}%
              </p>
              <p className="text-12 font-semibold text-sivac-muted mt-1">
                Tasa global de estándares aprobados
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
                {visitsCompleted}
              </p>
              <p className="text-12 font-medium text-sivac-muted mt-1">
                Supervisiones completadas con conformidad
              </p>
            </div>
          </div>

          {/* Stat Card 3: Auditorías Observadas */}
          <div className="admin-card p-6 border-l-4 border-l-sivac-yellow hover:border-sivac-blue/30 transition-all flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                VISITAS OBSERVADAS
              </span>
              <div className="text-sivac-yellow p-1 bg-sivac-yellow/5 rounded">
                <AlertCircle size={16} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-36 font-bold text-sivac-yellow leading-none">
                {visitsObservadas}
              </p>
              <p className="text-12 font-medium text-sivac-muted mt-1">
                Requieren revisión manual o plan de acción
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
                Desempeño Mensual (2026)
              </h3>
              <p className="text-12 font-normal text-sivac-muted mt-0.5">
                Variación promedio de cumplimiento de estándares de los últimos meses.
              </p>
            </div>

            {/* Bar Chart CSS */}
            <div className="h-[240px] flex items-end justify-around border-b border-sivac-border-card px-4 pt-6">
              {monthlyStats.map((ms, i) => {
                const barHeight = Math.max(ms.compliance, 5); // min size to show bar
                const isCurrent = ms.name === "Jun";
                return (
                  <div key={i} className="flex flex-col items-center w-12 group">
                    <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                      {ms.compliance}%
                    </span>
                    <div className={`w-10 rounded-t transition-all duration-500 cursor-pointer ${
                      isCurrent ? "bg-sivac-indigo hover:bg-sivac-indigo-light" : "bg-sivac-blue hover:bg-blue-500"
                    }`} style={{ height: `${(barHeight / 100) * 180}px` }} />
                    <span className={`text-12 mt-3 ${isCurrent ? "text-sivac-indigo font-semibold" : "text-sivac-muted"}`}>
                      {ms.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alertas por Sede (Donut Chart) */}
          <div className="admin-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-16 font-bold text-sivac-heading">
                Distribución de Alertas
              </h3>
              <p className="text-12 font-normal text-sivac-muted mt-0.5 mb-6">
                Distribución porcentual de alertas críticas y medias detectadas.
              </p>
            </div>

            <div className="flex items-center justify-around my-auto gap-4">
              {/* Donut SVG */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#111827"
                    strokeWidth="3.5"
                  />
                  {totalVisits > 0 ? (
                    <>
                      {/* Alertas (Yellow/Red) */}
                      {pctAlertas > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="3.5"
                          strokeDasharray={`${pctAlertas} 100`}
                          strokeDashoffset="0"
                        />
                      )}
                      {/* Sin observaciones (Gray/Green) */}
                      {pctOptimas > 0 && (
                        <circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke="#22c55e"
                          strokeWidth="3.5"
                          strokeDasharray={`${pctOptimas} 100`}
                          strokeDashoffset={`-${pctAlertas}`}
                        />
                      )}
                    </>
                  ) : (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#374151"
                      strokeWidth="3.5"
                    />
                  )}
                </svg>
                {/* Center Info text */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-20 font-bold text-sivac-heading">{pctAlertas}%</span>
                  <span className="text-[9px] font-bold text-sivac-muted uppercase tracking-wider">Alertas</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-3 text-[12px]">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded bg-sivac-red shrink-0" />
                  <div>
                    <p className="text-14 font-semibold text-sivac-heading">Alertas Activas ({pctAlertas}%)</p>
                    <p className="text-12 text-sivac-muted">{visitsObservadas} visitas con observaciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded bg-sivac-green shrink-0" />
                  <div>
                    <p className="text-14 font-semibold text-sivac-heading">Sin Observaciones ({pctOptimas}%)</p>
                    <p className="text-12 text-sivac-muted">{totalVisits - visitsObservadas} visitas conformes</p>
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
