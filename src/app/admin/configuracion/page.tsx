"use client";

import React, { useState } from "react";
import { Check, Building2, Calendar, BookOpen, Clock, Trash2, Plus } from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";

export default function ConfigurableSettingsPage() {
  const [sedes, setSedes] = useState(["Sede Central Lima", "Sede Norte Los Olivos"]);
  const [cursos, setCursos] = useState(["Matemática Básica", "Física Aplicada", "Química General"]);
  const [ciclos, setCiclos] = useState(["2026-I", "2025-II", "2025-I"]);
  const [turnos, setTurnos] = useState(["Mañana", "Tarde", "Noche"]);

  const deleteItem = (listName: string, index: number) => {
    if (listName === "sedes") setSedes(sedes.filter((_, i) => i !== index));
    if (listName === "cursos") setCursos(cursos.filter((_, i) => i !== index));
    if (listName === "ciclos") setCiclos(ciclos.filter((_, i) => i !== index));
    if (listName === "turnos") setTurnos(turnos.filter((_, i) => i !== index));
  };

  return (
    <AccessGuard allowedRoles={["Admin"]}>
      <div className="space-y-8 font-inter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Configuración del Sistema
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Administración de listas desplegables, parámetros globales y catálogos institucionales (Permisos de Administrador).
          </p>
        </div>

        <button
          type="button"
          className="h-[40px] px-5 bg-sivac-green hover:bg-green-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06 shadow-lg shadow-sivac-green/10"
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Grid 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Col 1, Card 1: Sedes */}
        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
              <Building2 size={18} strokeWidth={2} className="text-sivac-indigo" />
              Sedes Institucionales
            </h3>
            <div className="space-y-2">
              {sedes.map((sede, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                >
                  <span>{sede}</span>
                  <button
                    type="button"
                    onClick={() => deleteItem("sedes", idx)}
                    className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded"
                    title="Eliminar Sede"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Agregar Sede
          </button>
        </div>

        {/* Col 2, Card 1: Ciclos */}
        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
              <Calendar size={18} strokeWidth={2} className="text-sivac-indigo" />
              Ciclos Académicos
            </h3>
            <div className="space-y-2">
              {ciclos.map((ciclo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                >
                  <span>{ciclo}</span>
                  <button
                    type="button"
                    onClick={() => deleteItem("ciclos", idx)}
                    className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded"
                    title="Eliminar Ciclo"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Agregar Ciclo
          </button>
        </div>

        {/* Col 1, Card 2: Asignaturas */}
        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
              <BookOpen size={18} strokeWidth={2} className="text-sivac-indigo" />
              Asignaturas / Cursos
            </h3>
            <div className="space-y-2">
              {cursos.map((curso, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                >
                  <span>{curso}</span>
                  <button
                    type="button"
                    onClick={() => deleteItem("cursos", idx)}
                    className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded"
                    title="Eliminar Asignatura"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Agregar Asignatura
          </button>
        </div>

        {/* Col 2, Card 2: Turnos */}
        <div className="admin-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
              <Clock size={18} strokeWidth={2} className="text-sivac-indigo" />
              Turnos Académicos
            </h3>
            <div className="space-y-2">
              {turnos.map((turno, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                >
                  <span>{turno}</span>
                  <button
                    type="button"
                    onClick={() => deleteItem("turnos", idx)}
                    className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded"
                    title="Eliminar Turno"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.5} />
            Agregar Turno
          </button>
        </div>
      </div>
    </div>
    </AccessGuard>
  );
}
