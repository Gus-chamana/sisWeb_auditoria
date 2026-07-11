"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Download,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/AuthContext";

interface SedeData {
  id: number;
  nombre: string;
}

interface VisitData {
  id: number;
  fecha_visita: string;
  estado_id: number;
  sede_id: number;
  sedes: { nombre: string } | null;
  aulas: { nombre: string } | null;
  asignaturas: { nombre: string } | null;
  docente: { nombres: string; apellidos: string } | null;
  auditor: { nombres: string; apellidos: string } | null;
  created_at: string;
  evidencias_fotos?: { id: number }[];
}

export default function DashboardPage() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [sedes, setSedes] = useState<SedeData[]>([]);

  const getEffectiveEstadoId = (v: VisitData) => {
    if (v.estado_id === 3 || v.estado_id === 4) {
      const hasEvidence = v.evidencias_fotos && v.evidencias_fotos.length > 0;
      return hasEvidence ? 3 : 4;
    }
    return v.estado_id;
  };

  useEffect(() => {
    if (authLoading || !user) return;
    async function loadData() {
      try {
        setLoading(true);
        let query = supabase
          .from("visitas")
          .select(`
            id,
            fecha_visita,
            estado_id,
            sede_id,
            created_at,
            sedes(nombre),
            aulas(nombre),
            asignaturas(nombre),
            docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
            auditor:usuarios!visitas_auditor_id_fkey(nombres, apellidos),
            evidencias_fotos(id)
          `)
          .is("deleted_at", null);

        // Los auditores solo pueden ver estadísticas de sus propias visitas
        if (user.rol === "Auditor") {
          query = query.eq("auditor_id", parseInt(user.id, 10));
        }

        const { data: visitsData, error: visitsError } = await query.order("id", { ascending: false });

        if (visitsError) console.error("Error fetching visits:", visitsError);
        else if (visitsData) setVisits(visitsData as any);

        // Fetch all sedes
        const { data: sedesData, error: sedesError } = await supabase
          .from("sedes")
          .select("id, nombre")
          .order("nombre");

        if (sedesError) console.error("Error fetching sedes:", sedesError);
        else if (sedesData) setSedes(sedesData);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase, user, authLoading]);

  // --- Helpers & Computations ---
  const getLocalTodayDateString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
  };

  const todayStr = getLocalTodayDateString();

  // KPIs
  const visitsToday = visits.filter(v => v.fecha_visita === todayStr).length;
  const visitsPending = visits.filter(v => getEffectiveEstadoId(v) === 1).length;
  const visitsCompleted = visits.filter(v => getEffectiveEstadoId(v) === 3).length;
  const alertsActive = visits.filter(v => getEffectiveEstadoId(v) === 4).length; // Observadas
  const totalVisits = visits.length;

  // Donut chart percentages
  const finalizadasCount = visitsCompleted;
  const enCursoCount = visits.filter(v => getEffectiveEstadoId(v) === 2).length;
  const pendientesCount = visitsPending;
  const observadasCount = alertsActive;

  const pctFinalizadas = totalVisits > 0 ? (finalizadasCount / totalVisits) * 100 : 0;
  const pctEnCurso = totalVisits > 0 ? (enCursoCount / totalVisits) * 100 : 0;
  const pctPendientes = totalVisits > 0 ? (pendientesCount / totalVisits) * 100 : 0;
  const pctObservadas = totalVisits > 0 ? (observadasCount / totalVisits) * 100 : 0;

  // Cumplimiento por Sede calculations
  const sedeCompliance = sedes.map(sede => {
    const sedeVisits = visits.filter(v => v.sede_id === sede.id);
    const total = sedeVisits.length;
    const completed = sedeVisits.filter(v => getEffectiveEstadoId(v) === 3).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      nombre: sede.nombre.split(" - ")[0],
      percentage,
      total
    };
  });

  // Docentes con observaciones
  const docenteObservationsMap: Record<string, number> = {};
  visits.forEach(v => {
    if (getEffectiveEstadoId(v) === 4 && v.docente) {
      const name = `${v.docente.nombres} ${v.docente.apellidos}`.trim();
      docenteObservationsMap[name] = (docenteObservationsMap[name] || 0) + 1;
    }
  });

  const observedDocentes = Object.entries(docenteObservationsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Time formatting helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Ahora mismo";
      if (diffMins < 60) return `Hace ${diffMins} min`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
    } catch {
      return "Recientemente";
    }
  };

  const getBadgeVariant = (estadoId: number): "green" | "blue" | "yellow" | "gray" | "red" => {
    if (estadoId === 3) return "green";
    if (estadoId === 2) return "blue";
    if (estadoId === 1) return "yellow";
    if (estadoId === 4) return "red";
    return "gray";
  };

  const getEventTitle = (estadoId: number) => {
    if (estadoId === 1) return "Visita programada";
    if (estadoId === 2) return "Visita en curso";
    if (estadoId === 3) return "Visita finalizada";
    if (estadoId === 4) return "Visita observada";
    return "Sincronización";
  };

  const getEventText = (v: VisitData) => {
    const course = v.asignaturas?.nombre || "Asignatura";
    const aula = v.aulas?.nombre || "Aula";
    const auditorName = v.auditor ? `${v.auditor.nombres} ${v.auditor.apellidos}`.trim() : "Auditor";
    const effectiveEstadoId = getEffectiveEstadoId(v);
    if (effectiveEstadoId === 3) return `Supervisión en ${aula} completada por ${auditorName}. Curso: ${course}.`;
    if (effectiveEstadoId === 4) return `Se registraron observaciones en ${aula}. Auditor: ${auditorName}.`;
    if (effectiveEstadoId === 2) return `Visita inopinada iniciada en ${aula} por ${auditorName}.`;
    return `Nueva visita programada para ${aula} con el curso ${course}.`;
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-sivac-blue animate-spin" />
          <p className="text-14 text-sivac-muted">Cargando métricas de supervisión...</p>
        </div>
      </div>
    );
  }

  return (
    <AccessGuard allowedRoles={["Admin", "Auditor"]}>
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
                {visitsToday}
              </span>
              <span className="text-12 font-semibold text-sivac-muted">
                {visitsToday === 1 ? "sesión activa" : "sesiones activas"}
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
                {visitsPending}
              </span>
              <span className="text-12 font-semibold text-sivac-muted font-normal">
                por supervisar
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
                {visitsCompleted}
              </span>
              <span className="text-12 font-semibold text-sivac-green-soft">
                {totalVisits > 0 ? `${Math.round((visitsCompleted / totalVisits) * 100)}%` : "0%"} del total
              </span>
            </div>
          </div>

          {/* Card 4: Alertas Activas */}
          <div className="admin-card p-6 flex flex-col justify-between h-[150px] relative overflow-hidden group hover:border-sivac-blue/30 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                VISITAS OBSERVADAS
              </span>
              <div className="p-2 rounded-lg bg-sivac-red/10 text-sivac-red">
                <AlertTriangle size={18} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-poppins text-48 font-bold text-sivac-heading leading-none">
                {alertsActive}
              </span>
              <div className="flex flex-col text-right text-12 font-semibold text-sivac-red-soft">
                <span>Requiere revisión</span>
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
                    Porcentaje de visitas inopinadas completadas con conformidad por sede.
                  </p>
                </div>
                <span className="text-12 font-semibold text-sivac-indigo bg-sivac-blue/10 px-2.5 py-1 rounded">
                  Ciclo Actual
                </span>
              </div>

              {/* Vertical Bar Chart (CSS Puro) */}
              <div className="h-[200px] flex items-end justify-around pt-4 px-4 border-b border-sivac-border-card">
                {sedeCompliance.map((sc, i) => {
                  const barHeight = Math.max(sc.percentage, 5); // Minimum height to show bar
                  return (
                    <div key={i} className="flex flex-col items-center w-1/4 group">
                      <span className="text-12 font-semibold text-sivac-heading opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                        {sc.percentage}%
                      </span>
                      <div
                        className="w-10 sm:w-16 bg-sivac-blue rounded-t transition-all duration-500 hover:bg-blue-500 cursor-pointer"
                        style={{ height: `${(barHeight / 100) * 160}px` }}
                      />
                      <span className="text-12 font-medium text-sivac-muted mt-3 text-center truncate w-full">
                        {sc.nombre}
                      </span>
                    </div>
                  );
                })}
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
                    Distribución total de visitas registradas en la base de datos.
                  </p>
                </div>

                <div className="flex items-center justify-around gap-2">
                  {/* SVG Donut */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#111827"
                        strokeWidth="3.2"
                      />
                      {totalVisits > 0 ? (
                        <>
                          {/* Circle 1 (Finalizadas, green): strokeDasharray="pct 100", offset="0" */}
                          {pctFinalizadas > 0 && (
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke="#22c55e"
                              strokeWidth="3.2"
                              strokeDasharray={`${pctFinalizadas} 100`}
                              strokeDashoffset="0"
                            />
                          )}
                          {/* Circle 2 (En Curso, blue) */}
                          {pctEnCurso > 0 && (
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke="#3b82f6"
                              strokeWidth="3.2"
                              strokeDasharray={`${pctEnCurso} 100`}
                              strokeDashoffset={`-${pctFinalizadas}`}
                            />
                          )}
                          {/* Circle 3 (Pendientes, yellow) */}
                          {pctPendientes > 0 && (
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke="#eab308"
                              strokeWidth="3.2"
                              strokeDasharray={`${pctPendientes} 100`}
                              strokeDashoffset={`-${pctFinalizadas + pctEnCurso}`}
                            />
                          )}
                          {/* Circle 4 (Observadas, red) */}
                          {pctObservadas > 0 && (
                            <circle
                              cx="18"
                              cy="18"
                              r="15.915"
                              fill="transparent"
                              stroke="#ef4444"
                              strokeWidth="3.2"
                              strokeDasharray={`${pctObservadas} 100`}
                              strokeDashoffset={`-${pctFinalizadas + pctEnCurso + pctPendientes}`}
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
                          strokeWidth="3.2"
                        />
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-20 font-bold text-sivac-heading">{totalVisits}</span>
                      <span className="text-[9px] font-bold text-sivac-muted uppercase tracking-wider">Total</span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />
                      <span className="text-sivac-heading font-semibold">{finalizadasCount}</span>
                      <span className="text-sivac-muted">Finalizadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shrink-0" />
                      <span className="text-sivac-heading font-semibold">{enCursoCount}</span>
                      <span className="text-sivac-muted">En Curso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shrink-0" />
                      <span className="text-sivac-heading font-semibold">{pendientesCount}</span>
                      <span className="text-sivac-muted">Pendientes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shrink-0" />
                      <span className="text-sivac-heading font-semibold">{observadasCount}</span>
                      <span className="text-sivac-muted">Observadas</span>
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
                  Docentes con visitas inopinadas observadas en el ciclo actual.
                </p>

                {observedDocentes.length > 0 ? (
                  <div className="space-y-4">
                    {observedDocentes.map((od, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-12 font-medium">
                          <span className="text-sivac-heading truncate max-w-[80%]">{od.name}</span>
                          <span className="text-sivac-muted">{od.count}</span>
                        </div>
                        <div className="h-2 bg-sivac-bg-input-admin rounded-full overflow-hidden">
                          <div className="h-full bg-sivac-red-light rounded-full" style={{ width: `${(od.count / observedDocentes[0].count) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-36 flex-col items-center justify-center text-center">
                    <CheckCircle2 className="text-sivac-green mb-2" size={24} />
                    <p className="text-13 font-semibold text-sivac-heading">Sin observaciones</p>
                    <p className="text-11 text-sivac-muted">No se registran visitas con observaciones.</p>
                  </div>
                )}
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
                Últimas visitas supervisadas y eventos en tiempo real.
              </p>
            </div>

            {/* Timeline */}
            <div className="flex-1 relative border-l border-sivac-border-card ml-2.5 space-y-6 pb-2">
              {visits.slice(0, 4).map((v, i) => {
                const effId = getEffectiveEstadoId(v);
                return (
                  <div key={v.id} className="relative pl-6 group">
                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-sivac-bg-card transition-transform group-hover:scale-125 ${
                      effId === 3 ? "bg-sivac-green" :
                      effId === 2 ? "bg-sivac-blue" :
                      effId === 1 ? "bg-sivac-yellow" :
                      "bg-sivac-red"
                    }`} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={getBadgeVariant(effId)}>
                          {getEventTitle(effId)}
                        </Badge>
                        <span className="text-11 text-sivac-dim">{formatTimeAgo(v.created_at)}</span>
                      </div>
                      <p className="text-12 font-normal text-sivac-body mt-1">
                        {getEventText(v)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {visits.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <Users className="text-sivac-dim mb-2" size={24} />
                  <p className="text-12 font-medium text-sivac-muted">Sin actividad reciente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AccessGuard>
  );
}
