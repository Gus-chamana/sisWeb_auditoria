"use client";

import React from "react";
import { PlusCircle, CheckCircle2, FileText, RefreshCw } from "lucide-react";

interface NotificationEvent {
  id: string;
  dotColor: string;
  textColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

export default function NotificacionesPage() {
  const events: NotificationEvent[] = [
    {
      id: "evt-1",
      dotColor: "bg-sivac-blue/10 text-sivac-blue border-sivac-blue/20",
      textColor: "text-sivac-blue",
      icon: <PlusCircle size={16} strokeWidth={2.5} />,
      title: "Visita creada",
      description: "Se programó una nueva visita de auditoría para la Sede Central (Docente: María García Lopez).",
      time: "Hace 5 min",
    },
    {
      id: "evt-2",
      dotColor: "bg-sivac-green/10 text-sivac-green border-sivac-green/20",
      textColor: "text-sivac-green",
      icon: <CheckCircle2 size={16} strokeWidth={2.5} />,
      title: "Auditoria finalizada",
      description: "El supervisor completó la inspección académica y registró una puntuación de 18.5/20.",
      time: "Hace 20 min",
    },
    {
      id: "evt-3",
      dotColor: "bg-sivac-yellow/10 text-sivac-yellow border-sivac-yellow/20",
      textColor: "text-sivac-yellow",
      icon: <FileText size={16} strokeWidth={2.5} />,
      title: "PDF generado",
      description: "El sistema compiló y generó el Reporte Mensual de Cumplimiento Académico para directores.",
      time: "Hace 1 hora",
    },
    {
      id: "evt-4",
      dotColor: "bg-sivac-green/10 text-sivac-green border-sivac-green/20",
      textColor: "text-sivac-green",
      icon: <RefreshCw size={16} strokeWidth={2.5} />,
      title: "Sincronizacion completada",
      description: "Sincronización de base de datos local con la nube centralizada finalizada con éxito (142 registros).",
      time: "Hoy 09:15 AM",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-inter">
      {/* Header Info */}
      <div>
        <h1 className="text-28 font-bold font-poppins text-sivac-light">
          Notificaciones
        </h1>
        <p className="text-14 font-normal text-sivac-body mt-1">
          Lista detallada de las alertas, sincronizaciones y eventos recientes dentro del sistema de auditoría.
        </p>
      </div>

      {/* Main Events List Panel */}
      <div className="admin-card overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-4 bg-sivac-bg-input-admin border-b border-sivac-border-card">
          <span className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
            HISTORIAL DE EVENTOS
          </span>
        </div>

        {/* Panel Content (List) */}
        <div className="divide-y divide-sivac-border-card">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-6 flex items-start gap-4 hover:bg-sivac-bg-secondary/15 transition-colors group"
            >
              {/* Event Icon / Dot Container */}
              <div className={`mt-0.5 p-2 rounded-lg border flex items-center justify-center ${event.dotColor}`}>
                {event.icon}
              </div>

              {/* Event Description */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="text-15 font-bold text-sivac-light group-hover:text-sivac-indigo transition-colors">
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
        </div>
      </div>
    </div>
  );
}
