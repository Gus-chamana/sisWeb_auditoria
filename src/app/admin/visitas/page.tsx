"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Eye, Edit2, ChevronLeft, ChevronRight } from "lucide-react";

interface Visit {
  id: string;
  status: "green" | "yellow" | "gray" | "red";
  statusText: string;
  fecha: string;
  docente: string;
  sede: string;
  asignatura: string;
  score: string;
  scoreColor?: string;
}

export default function VisitasPage() {
  const visits: Visit[] = [
    {
      id: "V-901",
      status: "green",
      statusText: "Completada",
      fecha: "14/05/2026",
      docente: "María García Lopez",
      sede: "Sede Central",
      asignatura: "Matemática Básica",
      score: "18.5",
      scoreColor: "text-sivac-green",
    },
    {
      id: "V-902",
      status: "yellow",
      statusText: "En progreso",
      fecha: "14/05/2026",
      docente: "Juan Pérez",
      sede: "Sede Norte",
      asignatura: "Física Aplicada",
      score: "--",
    },
    {
      id: "V-903",
      status: "green",
      statusText: "Completada",
      fecha: "13/05/2026",
      docente: "Carlos Mendoza",
      sede: "Sede Sur",
      asignatura: "Química General",
      score: "15.0",
      scoreColor: "text-sivac-green-light",
    },
    {
      id: "V-904",
      status: "red",
      statusText: "Observada",
      fecha: "12/05/2026",
      docente: "Ana Torres",
      sede: "Sede Este",
      asignatura: "Historia del Arte",
      score: "10.5",
      scoreColor: "text-sivac-red-light",
    },
    {
      id: "V-905",
      status: "gray",
      statusText: "Pendiente",
      fecha: "15/05/2026",
      docente: "Luis Miranda",
      sede: "Sede Oeste",
      asignatura: "Lenguaje y Comunicación",
      score: "--",
    },
  ];

  return (
    <div className="space-y-6 font-inter">
      {/* Header with Page Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-24 font-bold font-poppins text-sivac-light">
            Gestión de Visitas
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Administra, filtra y consulta todas las visitas de auditoría programadas y realizadas.
          </p>
        </div>

        <button
          type="button"
          className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nueva Visita</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-sivac-bg-secondary/40 p-4 rounded-lg border border-sivac-border-card">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sivac-muted">
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Buscar docente, sede o asignatura..."
            className="input-admin w-full h-[40px] pl-10 pr-4 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select className="h-[40px] px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-body outline-none focus:border-sivac-blue">
            <option>Sede: Todas</option>
            <option>Sede Central</option>
            <option>Sede Norte</option>
            <option>Sede Sur</option>
          </select>
          <select className="h-[40px] px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-body outline-none focus:border-sivac-blue">
            <option>Estado: Todos</option>
            <option>Completada</option>
            <option>En progreso</option>
            <option>Observada</option>
            <option>Pendiente</option>
          </select>
        </div>
      </div>

      {/* Visits Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sivac-bg-input-admin border-b border-sivac-border-card">
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  ESTADO
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  FECHA
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  DOCENTE
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  SEDE
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  ASIGNATURA
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase text-center">
                  SCORE
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase text-center">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sivac-border-card">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-sivac-bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={visit.status}>{visit.statusText}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data">
                    {visit.fecha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-14 font-semibold text-sivac-light">
                    {visit.docente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data">
                    {visit.sede}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data">
                    {visit.asignatura}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-14 font-bold text-center ${visit.scoreColor || "text-sivac-muted"}`}>
                    {visit.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* View Button */}
                      <button
                        type="button"
                        className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                        title="Ver detalles"
                      >
                        <Eye size={18} strokeWidth={2} />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        className="p-1.5 text-sivac-muted hover:text-sivac-yellow transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                        title="Editar"
                      >
                        <Edit2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-sivac-border-card bg-sivac-bg-secondary/10">
          <p className="text-12 font-normal text-sivac-muted">
            Mostrando <span className="font-semibold text-sivac-light">1 a 5</span> de <span className="font-semibold text-sivac-light">45</span> visitas
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              type="button"
              className="p-1.5 rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-sivac-blue text-sivac-surface text-12 font-bold"
            >
              1
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary text-12 font-semibold transition-colors"
            >
              2
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary text-12 font-semibold transition-colors"
            >
              3
            </button>

            {/* Next Button */}
            <button
              type="button"
              className="p-1.5 rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary transition-colors"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
