"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/AuthContext";
import { AccessGuard } from "@/components/layout/AccessGuard";

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
  evidencias_fotos?: { id: number; fecha_captura?: string }[];
  ultimo_paso_completado?: number;
  firma_docente_b64?: string;
}

export default function NotificacionesPage() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<VisitData[]>([]);

  const getEffectiveEstadoId = (v: any) => {
    const hasEvidence = v.evidencias_fotos && v.evidencias_fotos.length > 0;
    const hasTeacherSignature = v.firma_docente_b64 && v.firma_docente_b64.trim() !== "";
    const step = v.ultimo_paso_completado || 1;

    if (step < 7) {
      return 2; 
    } else {
      if (!hasTeacherSignature) {
        return 1; 
      } else {
        return hasEvidence ? 3 : 4; 
      }
    }
  };

  const getLastActivityTime = (v: any) => {
    let lastTime = new Date(v.created_at).getTime();
    if (v.evidencias_fotos && v.evidencias_fotos.length > 0) {
      v.evidencias_fotos.forEach((photo: any) => {
        if (photo.fecha_captura) {
          const photoTime = new Date(photo.fecha_captura).getTime();
          if (photoTime > lastTime) {
            lastTime = photoTime;
          }
        }
      });
    }
    return lastTime;
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Ahora mismo";
      if (diffMins < 60) return `Hace ${diffMins} min`;
      
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      if (diffHours < 24) {
        return remainingMins > 0 
          ? `Hace ${diffHours} h ${remainingMins} min` 
          : `Hace ${diffHours} h`;
      }
      
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      return remainingHours > 0 || remainingMins > 0
        ? `Hace ${diffDays} d ${remainingHours} h ${remainingMins} min`
        : `Hace ${diffDays} d`;
    } catch {
      return "Recientemente";
    }
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
            ultimo_paso_completado,
            firma_docente_b64,
            sedes(nombre),
            aulas(nombre),
            asignaturas(nombre),
            docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
            auditor:usuarios!visitas_auditor_id_fkey(nombres, apellidos),
            evidencias_fotos(id, fecha_captura)
          `)
          .is("deleted_at", null);

        if (user?.rol === "Auditor") {
          query = query.eq("auditor_id", parseInt(user?.id || "0", 10));
        } else if (user?.rol === "Docente") {
          query = query.eq("docente_id", parseInt(user?.id || "0", 10));
        }

        const { data: visitsData, error: visitsError } = await query.order("id", { ascending: false });

        if (visitsError) {
          console.error("Error fetching visits for notifications:", visitsError);
        } else if (visitsData) {
          
          const sorted = [...visitsData].sort((a: any, b: any) => {
            return getLastActivityTime(b) - getLastActivityTime(a);
          });
          setVisits(sorted as any);

          
          try {
            const readMap: Record<number, number> = {};
            sorted.forEach((v) => {
              readMap[v.id] = getLastActivityTime(v);
            });
            localStorage.setItem("sivac_read_notifications", JSON.stringify(readMap));
          } catch (e) {
            console.error("Error saving read notifications map:", e);
          }
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase, user, authLoading]);

  if (loading || authLoading) {
    return (
      <AccessGuard allowedRoles={["Admin", "Auditor", "Docente"]}>
        <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={36} className="text-sivac-blue animate-spin" />
            <p className="text-14 text-sivac-muted">Cargando notificaciones...</p>
          </div>
        </div>
      </AccessGuard>
    );
  }

  
  const events = visits.map((v) => {
    const effId = getEffectiveEstadoId(v);
    const time = formatTimeAgo(new Date(getLastActivityTime(v)).toISOString());
    const course = v.asignaturas?.nombre || "Asignatura";
    const aula = v.aulas?.nombre || "Aula";
    const sede = v.sedes?.nombre?.split(" - ")[0] || "Sede";
    const auditorName = v.auditor ? `${v.auditor.nombres} ${v.auditor.apellidos}`.trim() : "Auditor";
    const docenteName = v.docente ? `${v.docente.nombres} ${v.docente.apellidos}`.trim() : "Docente";

    let icon = <PlusCircle size={16} strokeWidth={2.5} />;
    let dotColor = "bg-sivac-blue/10 text-sivac-blue border-sivac-blue/20";
    let title = "Visita creada";
    let description = `Se inició una nueva visita inopinada en el ${aula} de la sede ${sede} para el docente ${docenteName}. Curso: ${course}.`;

    if (effId === 3) {
      icon = <CheckCircle2 size={16} strokeWidth={2.5} />;
      dotColor = "bg-sivac-green/10 text-sivac-green border-sivac-green/20";
      title = "Auditoría finalizada";
      description = `Supervisión en el ${aula} (Sede ${sede}) completada con éxito por ${auditorName}. Docente: ${docenteName}. Curso: ${course}.`;
    } else if (effId === 4) {
      icon = <AlertCircle size={16} strokeWidth={2.5} />;
      dotColor = "bg-sivac-red/10 text-sivac-red border-sivac-red/20";
      title = "Visita observada";
      description = `Se finalizó la inspección en el ${aula} (Sede ${sede}) con observaciones pendientes (Faltan evidencias fotográficas). Auditor: ${auditorName}.`;
    } else if (effId === 1) {
      icon = <HelpCircle size={16} strokeWidth={2.5} />;
      dotColor = "bg-sivac-yellow/10 text-sivac-yellow border-sivac-yellow/20";
      title = "Firma pendiente";
      description = `La visita en el ${aula} (Sede ${sede}) se ha guardado, pero falta la firma digital de conformidad por parte del docente (${docenteName}).`;
    }

    return {
      id: `evt-${v.id}`,
      dotColor,
      icon,
      title,
      description,
      time,
    };
  });

  return (
    <AccessGuard allowedRoles={["Admin", "Auditor", "Docente"]}>
      <div className="max-w-4xl mx-auto space-y-6 font-inter">
        {}
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Notificaciones
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Lista detallada de las alertas, sincronizaciones y eventos recientes dentro del sistema de auditoría.
          </p>
        </div>

        {}
        <div className="admin-card overflow-hidden">
          {}
          <div className="px-6 py-4 bg-sivac-bg-input-admin border-b border-sivac-border-card">
            <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
              HISTORIAL DE EVENTOS REALES
            </span>
          </div>

          {}
          <div className="divide-y divide-sivac-border-card bg-sivac-bg-surface">
            {events.slice(0, 7).map((event) => (
              <div
                key={event.id}
                className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group"
              >
                {}
                <div className={`mt-0.5 p-2 rounded-lg border flex items-center justify-center ${event.dotColor}`}>
                  {event.icon}
                </div>

                {}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h4 className="text-15 font-bold text-sivac-light group-hover:opacity-80 transition-colors">
                      {event.title}
                    </h4>
                    <span className="text-12 font-semibold text-sivac-dim">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-13.5 font-normal text-sivac-body mt-1 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="p-12 text-center text-sivac-muted bg-sivac-bg-surface">
                No hay notificaciones ni eventos registrados.
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGuard>
  );
}
