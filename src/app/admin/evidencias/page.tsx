"use client";

import React from "react";
import { UploadCloud, Camera, Image as ImageIcon, Calendar, MapPin, Trash2 } from "lucide-react";

interface EvidenceCard {
  id: string;
  section: string;
  filename: string;
  datetime: string;
  location: string;
  size: string;
}

export default function EvidenciasPage() {
  const cards: EvidenceCard[] = [
    {
      id: "ev-01",
      section: "Sección: Material utilizado",
      filename: "pizarra_matematica_central.jpg",
      datetime: "14/05/2026 · 10:15 AM",
      location: "Sede Central - Aula 402",
      size: "2.4 MB",
    },
    {
      id: "ev-02",
      section: "Sección: Control de asistencia",
      filename: "asistencia_firmas_14_05.jpg",
      datetime: "14/05/2026 · 10:30 AM",
      location: "Sede Central - Aula 402",
      size: "1.8 MB",
    },
  ];

  return (
    <div className="space-y-8 font-inter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Evidencias Digitales
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Gestión visual de evidencias tomadas en aula (Soporta trabajo Offline y sincronización automática).
          </p>
        </div>

        <button
          type="button"
          className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06"
        >
          <UploadCloud size={16} strokeWidth={2.5} />
          <span>Subir Fotografías</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div className="bg-sivac-bg-input-admin border-2 border-dashed border-sivac-border-card hover:border-sivac-blue/50 rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
        <div className="w-14 h-14 rounded-full bg-sivac-bg-surface border border-sivac-border-card flex items-center justify-center text-sivac-muted group-hover:text-sivac-blue transition-colors shadow-inner mb-4">
          <Camera size={26} strokeWidth={1.5} />
        </div>
        <h3 className="text-16 font-semibold text-sivac-light mb-1">
          Arrastra y suelta tus archivos aquí
        </h3>
        <p className="text-14 font-normal text-sivac-muted mb-2">
          O haz clic para examinar en tu dispositivo local
        </p>
        <span className="text-12 font-medium text-sivac-dim bg-sivac-bg-surface px-3 py-1 rounded-md border border-sivac-border-card">
          Soporta JPG, PNG (Max. 5MB)
        </span>
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h2 className="text-18 font-bold text-sivac-light">
          Evidencias Registradas en esta Visita
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="admin-card overflow-hidden flex flex-col sm:flex-row group hover:border-sivac-blue/30 transition-all">
              {/* Image Preview Placeholder */}
              <div className="w-full sm:w-[180px] h-[160px] sm:h-auto bg-sivac-bg-input-admin border-b sm:border-b-0 sm:border-r border-sivac-border-card flex flex-col items-center justify-center text-sivac-dim relative overflow-hidden group-hover:bg-sivac-bg-secondary/10 transition-colors">
                <ImageIcon size={36} strokeWidth={1.5} className="mb-2" />
                <span className="text-11 font-medium tracking-wide uppercase">{card.size}</span>
                {/* Decorative border accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sivac-blue" />
              </div>

              {/* Card Meta Content */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-12 font-bold text-sivac-indigo bg-sivac-blue/10 px-2 py-0.5 rounded">
                    {card.section}
                  </span>
                  <h4 className="text-14 font-semibold text-sivac-light truncate pt-1">
                    {card.filename}
                  </h4>
                  <div className="text-12 text-sivac-muted space-y-0.5 pt-1">
                    <p className="flex items-center gap-1.5 font-normal">
                      <Calendar size={14} strokeWidth={2} className="text-sivac-dim" />
                      {card.datetime}
                    </p>
                    <p className="flex items-center gap-1.5 font-normal">
                      <MapPin size={14} strokeWidth={2} className="text-sivac-dim" />
                      {card.location}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-sivac-border-card">
                  <button
                    type="button"
                    className="flex-1 h-[32px] rounded border border-sivac-border-card text-12 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-secondary transition-colors"
                  >
                    Ver Evidencia
                  </button>
                  <button
                    type="button"
                    className="h-[32px] px-3 rounded border border-sivac-red/30 hover:border-sivac-red hover:bg-sivac-red/10 text-sivac-red-light transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
