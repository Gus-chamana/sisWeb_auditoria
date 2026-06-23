"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Printer,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Calendar,
  Layers,
  RotateCcw,
  Sparkles,
  BookOpen
} from "lucide-react";
import { FormatoVisitaUTP } from "@/components/Diseño/FormatoPDF/FormatoVisitaUTP";
import { useAuth } from "@/lib/AuthContext";

// -----------------------------------------------------------
// Base de datos de auditorías (Mock)
// -----------------------------------------------------------
interface AuditRecord {
  id: string;
  aula: string;
  laboratorio: string;
  asignatura: string;
  docenteNombre: string;
  docenteId: string;
  sedeFilial: string;
  ciclo: string;
  turno: string;
  fechaVisita: string;
  horaInicio: string;
  horaTermino: string;
  estado: "Cumplido" | "Pendiente";
  
  // Detalle del formato de auditoría
  docentePresente?: "SI" | "NO" | "";
  horarioProgramado?: "Cumple" | "No Cumple" | "";
  interaccion?: "SI" | "NO" | "";
  actividad?: string;
  obs1?: string;
  materialCargado?: "CUMPLE" | "NO CUMPLE" | "";
  obs2?: string;
  asistenciaAmbiente?: "Cumple" | "No cumple" | "";
  asistenciaAmbienteObs?: string;
  asistenciaIntranet?: "Cumple" | "No cumple" | "";
  asistenciaIntranetObs?: string;
  obs3?: string;
  silaboCoincide?: "CUMPLE" | "NO CUMPLE" | "";
  temaAnteriorCoincide?: "CUMPLE" | "NO CUMPLE" | "";
  ingresoSilaboVirtual?: "CUMPLE" | "NO CUMPLE" | "";
  obs4?: string;
  guiaPractica?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  logroMedir?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  rubricaEvaluacion?: "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "";
  obs5?: string;
  responsableActividad?: string;
  requerimientosSolicitados?: string;
}

const MOCK_AUDITS: AuditRecord[] = [
  {
    id: "visit-1",
    aula: "Aula B-402",
    laboratorio: "Laboratorio de Cómputo",
    asignatura: "Arquitectura de Software (12402)",
    docenteNombre: "Dr. Ing. Hugo Cabrera Rojas",
    docenteId: "DOC-1021",
    sedeFilial: "Sede Central - Lima",
    ciclo: "2026-I",
    turno: "Noche",
    fechaVisita: "22/06/2026",
    horaInicio: "19:00",
    horaTermino: "20:30",
    estado: "Cumplido",
    docentePresente: "SI",
    horarioProgramado: "Cumple",
    interaccion: "SI",
    actividad: "Exposición de patrones estructurales y desarrollo guiado de taller práctico en la nube.",
    obs1: "El docente inició sesión puntualmente y brindó soporte personalizado a los equipos de desarrollo.",
    materialCargado: "CUMPLE",
    obs2: "Las diapositivas y el laboratorio práctico estaban subidos a la plataforma Canvas desde las 08:00 hrs del mismo día.",
    asistenciaAmbiente: "Cumple",
    asistenciaAmbienteObs: "28 estudiantes presentes en laboratorio.",
    asistenciaIntranet: "Cumple",
    asistenciaIntranetObs: "Asistencia registrada en portal docente.",
    obs3: "La lista de asistencia física concuerda plenamente con el reporte del sistema intranet.",
    silaboCoincide: "CUMPLE",
    temaAnteriorCoincide: "CUMPLE",
    ingresoSilaboVirtual: "CUMPLE",
    obs4: "Avance temático según cronograma del sílabo oficial.",
    guiaPractica: "CUMPLE",
    logroMedir: "CUMPLE",
    rubricaEvaluacion: "CUMPLE",
    obs5: "Se utilizó la rúbrica del laboratorio 3 cargada en Canvas. Los estudiantes mostraron dominio del logro planteado.",
    responsableActividad: "Mg. Luis Ernesto Quispe (Auditor Interno de Calidad)",
    requerimientosSolicitados: "Verificación de portafolio docente digital, silabo en físico y revisión del aula virtual en tiempo real.",
  },
  {
    id: "visit-2",
    aula: "Aula A-301",
    laboratorio: "Laboratorio Químico",
    asignatura: "Ingeniería de Requerimientos (12405)",
    docenteNombre: "Mag. Elena Valenzuela Soto",
    docenteId: "DOC-4502",
    sedeFilial: "Sede Norte - Los Olivos",
    ciclo: "2026-I",
    turno: "Tarde",
    fechaVisita: "23/06/2026",
    horaInicio: "15:00",
    horaTermino: "16:30",
    estado: "Cumplido",
    docentePresente: "SI",
    horarioProgramado: "Cumple",
    interaccion: "SI",
    actividad: "Talleres prácticos grupales de diagramas de casos de uso y especificaciones técnicas.",
    obs1: "Sesión interactiva dinámica. Los alumnos participaron activamente en la pizarra interactiva.",
    materialCargado: "CUMPLE",
    obs2: "Guía de requerimientos y plantillas publicadas en Canvas con anterioridad.",
    asistenciaAmbiente: "Cumple",
    asistenciaAmbienteObs: "22 alumnos en el laboratorio físico.",
    asistenciaIntranet: "Cumple",
    asistenciaIntranetObs: "Marcación y control en Intranet correcto.",
    obs3: "Sincronización del 100% de asistencia entre presencial e intranet.",
    silaboCoincide: "CUMPLE",
    temaAnteriorCoincide: "CUMPLE",
    ingresoSilaboVirtual: "CUMPLE",
    obs4: "Seguimiento correcto del plan curricular semanal.",
    guiaPractica: "CUMPLE",
    logroMedir: "CUMPLE",
    rubricaEvaluacion: "NO APLICA",
    obs5: "No se programó evaluación para esta sesión. Se utilizó rúbrica formativa general.",
    responsableActividad: "Mg. Carlos Mendoza Ortiz (Auditor Académico)",
    requerimientosSolicitados: "Plantilla del proyecto grupal, rúbricas de retroalimentación de Canvas.",
  },
  {
    id: "visit-3",
    aula: "Aula C-102",
    laboratorio: "Aula Multiuso",
    asignatura: "Diseño y Patrones de Software (12410)",
    docenteNombre: "Ing. Carlos Alberto Mendoza Ortiz",
    docenteId: "DOC-2309",
    sedeFilial: "Sede Sur - Chorrillos",
    ciclo: "2025-II",
    turno: "Mañana",
    fechaVisita: "15/11/2025",
    horaInicio: "09:00",
    horaTermino: "10:30",
    estado: "Cumplido",
    docentePresente: "SI",
    horarioProgramado: "Cumple",
    interaccion: "SI",
    actividad: "Exposición de patrones creacionales Singleton y Factory Method con ejemplos en Java.",
    obs1: "El docente llegó 5 minutos antes para verificar proyectores y equipos.",
    materialCargado: "CUMPLE",
    obs2: "Repositorio GitHub del curso actualizado y disponible para los estudiantes.",
    asistenciaAmbiente: "Cumple",
    asistenciaAmbienteObs: "18 estudiantes asistentes.",
    asistenciaIntranet: "Cumple",
    asistenciaIntranetObs: "Sistema intranet validado.",
    obs3: "Asistencia cuadrada perfectamente.",
    silaboCoincide: "CUMPLE",
    temaAnteriorCoincide: "CUMPLE",
    ingresoSilaboVirtual: "CUMPLE",
    obs4: "Avance acorde con cronograma de la semana 8.",
    guiaPractica: "CUMPLE",
    logroMedir: "CUMPLE",
    rubricaEvaluacion: "CUMPLE",
    obs5: "Rúbrica de la T1 mostrada a los estudiantes al inicio de clase.",
    responsableActividad: "Dra. Ana Martínez Ruiz (Supervisora de Calidad)",
    requerimientosSolicitados: "Sílabo impreso y código fuente de ejemplos prácticos.",
  },
  {
    id: "visit-4",
    aula: "Aula A-101",
    laboratorio: "Laboratorio de Base de Datos",
    asignatura: "Base de Datos I (11029)",
    docenteNombre: "María García López",
    docenteId: "DOC-7834", // Coincide con docente actual si ROL_ACTIVO === 'Docente'
    sedeFilial: "Sede Norte - Los Olivos",
    ciclo: "2026-I",
    turno: "Noche",
    fechaVisita: "20/06/2026",
    horaInicio: "19:00",
    horaTermino: "20:30",
    estado: "Cumplido",
    docentePresente: "SI",
    horarioProgramado: "Cumple",
    interaccion: "SI",
    actividad: "Modelado de diagramas entidad-relación y normalización hasta 3FN.",
    obs1: "Explicación fluida y con participación activa en pizarra y software de diagramación.",
    materialCargado: "CUMPLE",
    obs2: "Diapositivas y casos prácticos cargados correctamente en Canvas.",
    asistenciaAmbiente: "Cumple",
    asistenciaAmbienteObs: "32 alumnos presentes.",
    asistenciaIntranet: "Cumple",
    asistenciaIntranetObs: "Asistencia marcada a la hora de ingreso.",
    obs3: "Tolerancia respetada y alumnos al día en asistencia virtual.",
    silaboCoincide: "CUMPLE",
    temaAnteriorCoincide: "CUMPLE",
    ingresoSilaboVirtual: "CUMPLE",
    obs4: "Se revisó avance según la semana 11 de la programación académica.",
    guiaPractica: "CUMPLE",
    logroMedir: "CUMPLE",
    rubricaEvaluacion: "CUMPLE",
    obs5: "Práctica dirigida calificada mediante rúbrica interactiva.",
    responsableActividad: "Mg. Luis Ernesto Quispe (Auditor Interno de Calidad)",
    requerimientosSolicitados: "Casos prácticos de normalización impresos y guías cargadas.",
  },
  {
    id: "visit-5",
    aula: "Aula B-205",
    laboratorio: "Laboratorio Avanzado",
    asignatura: "Calidad de Software (12480)",
    docenteNombre: "Pedro Martínez Díaz",
    docenteId: "DOC-9921",
    sedeFilial: "Sede Central - Lima",
    ciclo: "2026-I",
    turno: "Tarde",
    fechaVisita: "25/06/2026",
    horaInicio: "17:00",
    horaTermino: "18:30",
    estado: "Pendiente",
    docentePresente: "",
    horarioProgramado: "",
    interaccion: "",
    actividad: "",
    obs1: "",
    materialCargado: "",
    obs2: "",
    asistenciaAmbiente: "",
    asistenciaAmbienteObs: "",
    asistenciaIntranet: "",
    asistenciaIntranetObs: "",
    obs3: "",
    silaboCoincide: "",
    temaAnteriorCoincide: "",
    ingresoSilaboVirtual: "",
    obs4: "",
    guiaPractica: "",
    logroMedir: "",
    rubricaEvaluacion: "",
    obs5: "",
    responsableActividad: "",
    requerimientosSolicitados: "",
  }
];

// Helper para parsear DD/MM/YYYY a objeto Date
const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
};

// Helper para parsear YYYY-MM-DD a objeto Date
const parseInputDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
};

export default function ReportesPage() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-60 bg-white/5 rounded-lg w-full" />
      </div>
    );
  }

  const ROL_ACTIVO = user.rol;
  const currentUser = user;
  const [checkedAuditIds, setCheckedAuditIds] = useState<string[]>([]);
  const [sedeFilter, setSedeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateMode, setTemplateMode] = useState<"filled" | "empty">("filled");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [expandedAulas, setExpandedAulas] = useState<Record<string, boolean>>({});

  const toggleAulaExpand = (aula: string) => {
    setExpandedAulas((prev) => ({
      ...prev,
      [aula]: !prev[aula],
    }));
  };

  // Filtrar registros según los roles del usuario logueado
  const getAllowedAudits = () => {
    if (ROL_ACTIVO === "Docente") {
      // Docente solo puede ver sus propias visitas
      return MOCK_AUDITS.filter((audit) => audit.docenteId === currentUser.id);
    }
    return MOCK_AUDITS;
  };

  const allowedAudits = getAllowedAudits();

  // Filtrado reactivo en base a filtros, búsquedas y rango de fechas
  const filteredAudits = allowedAudits.filter((audit) => {
    const matchesSearch =
      audit.aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.docenteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.asignatura.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSede =
      sedeFilter === "all" ||
      audit.sedeFilial.toLowerCase().includes(sedeFilter.toLowerCase());

    const matchesState =
      stateFilter === "all" ||
      (stateFilter === "cumplido" && audit.estado === "Cumplido") ||
      (stateFilter === "pendiente" && audit.estado === "Pendiente");

    // Filtrar por rango de fechas
    const auditDate = parseDateString(audit.fechaVisita);
    const start = parseInputDateString(startDate);
    const end = parseInputDateString(endDate);

    if (auditDate) {
      if (start && auditDate < start) return false;
      if (end && auditDate > end) return false;
    }

    return matchesSearch && matchesSede && matchesState;
  });

  const groupedAudits = React.useMemo(() => {
    const groups: Record<string, AuditRecord[]> = {};
    filteredAudits.forEach((audit) => {
      const key = audit.aula;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(audit);
    });
    return groups;
  }, [filteredAudits]);

  // Limpiar IDs seleccionados que ya no están visibles debido a filtros
  useEffect(() => {
    if (checkedAuditIds.length > 0) {
      const visibleIds = new Set(filteredAudits.map((a) => a.id));
      setCheckedAuditIds((prev) => prev.filter((id) => visibleIds.has(id)));
    }
  }, [filteredAudits]);

  const handleToggleSelectAudit = (id: string) => {
    setCheckedAuditIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredAudits.length > 0 &&
    filteredAudits.every((audit) => checkedAuditIds.includes(audit.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredAudits.map((a) => a.id);
      setCheckedAuditIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredAudits.map((a) => a.id);
      setCheckedAuditIds((prev) => {
        const uniqueIds = new Set([...prev, ...filteredIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Preparar la data para el componente de PDF
  const getReportData = (audit: AuditRecord) => {
    return templateMode === "filled"
      ? {
          fechaVisita: audit.fechaVisita,
          horaInicio: audit.horaInicio,
          horaTermino: audit.horaTermino,
          sedeFilial: audit.sedeFilial,
          ciclo: audit.ciclo,
          turno: audit.turno,
          asignatura: audit.asignatura,
          campoFormativo: "Ingeniería de Software / Tecnologías de la Información",
          semanaNo: "12",
          horaPracticaTeoria: audit.turno === "Noche" ? "Teoría y Práctica Integrada" : "Práctica de Laboratorio",
          lugarVisita: `${audit.aula} (${audit.laboratorio})`,
          docenteNombre: audit.docenteNombre,
          docentePresente: audit.docentePresente,
          horarioProgramado: audit.horarioProgramado,
          interaccion: audit.interaccion,
          actividad: audit.actividad,
          obs1: audit.obs1,
          materialCargado: audit.materialCargado,
          obs2: audit.obs2,
          asistenciaAmbiente: audit.asistenciaAmbiente,
          asistenciaAmbienteObs: audit.asistenciaAmbienteObs,
          asistenciaIntranet: audit.asistenciaIntranet,
          asistenciaIntranetObs: audit.asistenciaIntranetObs,
          obs3: audit.obs3,
          silaboCoincide: audit.silaboCoincide,
          temaAnteriorCoincide: audit.temaAnteriorCoincide,
          ingresoSilaboVirtual: audit.ingresoSilaboVirtual,
          obs4: audit.obs4,
          guiaPractica: audit.guiaPractica,
          logroMedir: audit.logroMedir,
          rubricaEvaluacion: audit.rubricaEvaluacion,
          obs5: audit.obs5,
          responsableActividad: audit.responsableActividad || "Mg. Luis Ernesto Quispe",
          requerimientosSolicitados: audit.requerimientosSolicitados || "Verificación de portafolio docente digital.",
        }
      : {}; // Retorna objeto vacío para simular plantilla en blanco
  };

  return (
    <div className="flex h-[calc(100vh-100px)] -m-8 relative overflow-hidden font-inter text-sivac-light bg-sivac-bg-primary">
      
      {/* ============================================================ */}
      {/* PANEL IZQUIERDO: Listado de Aulas/Visitas (Colapsable)     */}
      {/* ============================================================ */}
      <div
        className={`bg-sivac-bg-surface flex flex-col border-r border-sivac-border transition-all duration-300 relative z-10 no-print ${
          isLeftCollapsed ? "w-0 overflow-hidden opacity-0" : "w-full md:w-[380px] lg:w-[420px]"
        }`}
      >
        <div className="p-6 border-b border-sivac-border space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-sivac-blue bg-sivac-blue/15 px-2 py-0.5 rounded border border-sivac-blue/30 inline-flex items-center gap-1 mb-2">
              <Sparkles size={10} /> {ROL_ACTIVO === "Docente" ? "Mis Sesiones" : "Supervisión Académica"}
            </span>
            <h1 className="text-20 font-bold font-poppins text-sivac-heading leading-tight">
              Aulas Supervisadas
            </h1>
            <p className="text-12 text-sivac-muted mt-1">
              {ROL_ACTIVO === "Docente"
                ? "Visualiza tus auditorías de visitas inopinadas."
                : "Busca y selecciona un aula para ver el formato físico."}
            </p>
          </div>

          {/* Buscador */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sivac-muted">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Buscar aula, docente o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[38px] pl-10 pr-4 text-13 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-sivac-light placeholder:text-sivac-dim focus:outline-none focus:border-sivac-blue transition-colors"
            />
          </div>

          {/* Filtros rápidos (Solo Admin / Auditor) */}
          {ROL_ACTIVO !== "Docente" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-sivac-muted uppercase mb-1">
                  Sede Filial
                </label>
                <select
                  value={sedeFilter}
                  onChange={(e) => setSedeFilter(e.target.value)}
                  className="w-full h-[34px] px-2 bg-sivac-bg-input-admin border border-sivac-border-card rounded text-12 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="all">Todas</option>
                  <option value="central">Central Lima</option>
                  <option value="norte">Norte Los Olivos</option>
                  <option value="sur">Sur Chorrillos</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-sivac-muted uppercase mb-1">
                  Estado
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full h-[34px] px-2 bg-sivac-bg-input-admin border border-sivac-border-card rounded text-12 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="cumplido">Cumplido</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>
          )}

          {/* Filtro de Rango de Fechas */}
          <div className="space-y-2 pt-2 border-t border-sivac-border/30">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold text-sivac-muted uppercase">
                Filtrar por fecha
              </label>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-[10px] text-sivac-indigo hover:text-sivac-red transition-colors flex items-center gap-1 font-semibold"
                >
                  <RotateCcw size={10} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-sivac-muted uppercase font-bold pl-0.5">Desde fecha</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-[34px] px-2 bg-sivac-bg-input-admin border border-sivac-border-card rounded text-12 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-sivac-muted uppercase font-bold pl-0.5">Hasta fecha</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-[34px] px-2 bg-sivac-bg-input-admin border border-sivac-border-card rounded text-12 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Seleccionar todo */}
        {filteredAudits.length > 0 && (
          <div className="px-6 py-2.5 bg-sivac-bg-secondary/20 border-b border-sivac-border/20 flex items-center justify-between no-print shrink-0">
            <label className="flex items-center gap-2 text-12 font-bold text-sivac-muted cursor-pointer hover:text-sivac-light transition-colors">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleToggleSelectAll}
                className="w-4 h-4 rounded border-sivac-border-card bg-sivac-bg-input-admin text-sivac-blue focus:ring-0 focus:ring-offset-0 cursor-pointer accent-sivac-blue"
              />
              <span>Seleccionar todo ({filteredAudits.length})</span>
            </label>
            {checkedAuditIds.length > 0 && (
              <button
                type="button"
                onClick={() => setCheckedAuditIds([])}
                className="text-[11px] text-sivac-indigo hover:text-sivac-red font-semibold transition-colors"
              >
                Limpiar selección
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedAudits).length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookOpen className="mx-auto text-sivac-dim" size={28} />
              <p className="text-13 text-sivac-muted font-medium">No se encontraron visitas</p>
              <p className="text-11 text-sivac-dim">Prueba ajustando el texto o los filtros de búsqueda.</p>
            </div>
          ) : (
            Object.entries(groupedAudits).map(([aula, audits]) => {
              const isExpanded = expandedAulas[aula] !== false;
              return (
                <div key={aula} className="space-y-2">
                  {/* Classroom Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleAulaExpand(aula)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-sivac-bg-secondary/60 hover:bg-sivac-bg-secondary border border-sivac-border-glass transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sivac-indigo shrink-0" />
                      <span className="text-14 font-bold text-sivac-heading font-poppins">{aula}</span>
                      <span className="text-11 text-sivac-muted bg-sivac-border-card/45 px-2 py-0.5 rounded-full">
                        {audits.length} {audits.length === 1 ? "reporte" : "reportes"}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-sivac-muted transition-transform duration-200 ${
                        isExpanded ? "" : "-rotate-95"
                      }`}
                    />
                  </button>

                  {/* Classroom Reports Cards List */}
                  {isExpanded && (
                    <div className="space-y-2.5 pl-3 border-l border-sivac-border-glass">
                      {audits.map((audit) => {
                        const isChecked = checkedAuditIds.includes(audit.id);
                        const isPending = audit.estado === "Pendiente";
                        
                        return (
                          <div
                            key={audit.id}
                            onClick={() => {
                              setCheckedAuditIds([audit.id]);
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative cursor-pointer ${
                              isChecked
                                ? "bg-sivac-blue/[0.06] border-sivac-blue/60 shadow-lg shadow-sivac-blue/5"
                                : "bg-sivac-bg-secondary/40 border-sivac-border-glass hover:bg-sivac-bg-secondary/80 hover:border-sivac-border/50"
                            }`}
                          >
                            {/* Checkbox, Curso y Estado */}
                            <div className="flex justify-between items-start w-full gap-3">
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={checkedAuditIds.includes(audit.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelectAudit(audit.id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded border-sivac-border-card bg-sivac-bg-input-admin text-sivac-blue focus:ring-0 focus:ring-offset-0 cursor-pointer accent-sivac-blue mt-0.5 shrink-0"
                                />
                                <div>
                                  <h4 className="text-13 font-bold text-sivac-heading font-poppins line-clamp-1">
                                    {audit.asignatura.split(" (")[0]}
                                  </h4>
                                  <p className="text-11 text-sivac-muted">{audit.laboratorio}</p>
                                </div>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                                  isPending
                                    ? "bg-sivac-yellow/10 text-sivac-yellow-soft border border-sivac-yellow/20"
                                    : "bg-sivac-green/10 text-sivac-green-light border border-sivac-green/20"
                                }`}
                              >
                                {isPending ? <Clock size={8} /> : <CheckCircle2 size={8} />}
                                {audit.estado}
                              </span>
                            </div>

                            {/* Docente */}
                            <div className="flex items-center gap-2 text-11 text-sivac-body mt-0.5">
                              <User size={12} className="text-sivac-dim shrink-0" />
                              <span className="truncate">{audit.docenteNombre}</span>
                            </div>

                            {/* Sede y Fecha */}
                            <div className="flex justify-between items-center text-[10px] text-sivac-muted border-t border-sivac-border/25 pt-2 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin size={10} className="shrink-0" />
                                {audit.sedeFilial.split(" - ")[0]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={10} className="shrink-0" />
                                {audit.fechaVisita}
                              </span>
                            </div>

                            {/* Barra lateral indicadora de selección */}
                            {isChecked && (
                              <div className="absolute left-0 top-3 bottom-3 w-1 bg-sivac-blue rounded-r" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTÓN FLOTANTE PARA EXPANDIR/COLAPSAR SIDEBAR IZQUIERDO     */}
      {/* ============================================================ */}
      <button
        onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
        className="absolute bottom-6 left-6 md:static md:flex items-center justify-center w-8 h-8 rounded-full bg-sivac-bg-toggle border border-sivac-border text-sivac-heading hover:text-white shadow-xl hover:bg-sivac-border transition-colors duration-150 z-20 cursor-pointer no-print self-center -mx-4 shrink-0"
        title={isLeftCollapsed ? "Mostrar lista de visitas" : "Ocultar lista de visitas"}
      >
        {isLeftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ============================================================ */}
      {/* PANEL DERECHO: Visor de PDF Dinámico e Interactivo         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col bg-sivac-bg-secondary/40 overflow-hidden relative">
        
        {/* Barra superior de herramientas del visor (Oculta en Impresión) */}
        <div className="h-[64px] bg-sivac-bg-surface/60 border-b border-sivac-border px-6 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-13 text-sivac-muted">
              <FileText size={16} className="text-sivac-dim" />
              <span>Visor del Formato Oficial</span>
            </div>
            
            {/* Toggle de Plantilla Lleno vs Vacío */}
            {checkedAuditIds.length > 0 && (
              <div className="flex h-[32px] rounded-lg border border-sivac-border-card p-0.5 bg-sivac-bg-input-admin w-[240px]">
                <button
                  type="button"
                  onClick={() => setTemplateMode("filled")}
                  className={`flex-1 flex items-center justify-center gap-1 rounded text-11 font-bold transition-all ${
                    templateMode === "filled"
                      ? "bg-sivac-blue text-white shadow"
                      : "text-sivac-muted hover:text-sivac-light"
                  }`}
                >
                  Reporte Lleno
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateMode("empty")}
                  className={`flex-1 flex items-center justify-center gap-1 rounded text-11 font-bold transition-all ${
                    templateMode === "empty"
                      ? "bg-sivac-blue text-white shadow"
                      : "text-sivac-muted hover:text-sivac-light"
                  }`}
                >
                  Plantilla Vacía
                </button>
              </div>
            )}
          </div>

          {/* Acciones de exportación */}
          <div className="flex items-center gap-2.5">
            {checkedAuditIds.length > 0 && (
              <button
                type="button"
                onClick={handlePrint}
                className="h-[36px] px-3.5 bg-sivac-blue hover:bg-blue-700 text-sivac-surface rounded-lg text-12 font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-sivac-blue/10 uppercase tracking-wider"
              >
                <Printer size={14} strokeWidth={2.5} />
                <span>
                  {checkedAuditIds.length > 1
                    ? `Imprimir Seleccionados (${checkedAuditIds.length})`
                    : "Imprimir Reporte"}
                </span>
              </button>
            )}
            
            <button
              type="button"
              className="h-[36px] px-3 border border-sivac-border-card hover:bg-sivac-bg-secondary text-sivac-body hover:text-sivac-heading rounded-lg transition-colors flex items-center justify-center gap-1 text-12"
              title="Descargar en formato PDF oficial"
            >
              <Download size={15} />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Contenedor del papel (Con fondo gris claro para emular hoja física en pantalla oscura) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center gap-8 bg-gray-900/60 print:bg-white print:p-0 print:gap-0">
          {checkedAuditIds.length > 0 ? (
            checkedAuditIds.map((id) => {
              const audit = MOCK_AUDITS.find((a) => a.id === id);
              if (!audit) return null;
              const data = getReportData(audit);
              return (
                <div
                  key={audit.id}
                  className="shadow-2xl shadow-black/80 rounded-lg print:shadow-none print:rounded-none print:break-after-page"
                >
                  <FormatoVisitaUTP {...data} />
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
              <div className="w-16 h-16 rounded-2xl bg-sivac-bg-surface flex items-center justify-center border border-sivac-border text-sivac-dim">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-16 font-bold text-sivac-heading">No hay reporte seleccionado</h3>
                <p className="text-13 text-sivac-muted max-w-sm">
                  Por favor, selecciona una visita de auditoría de la lista del panel izquierdo marcando su casilla para previsualizar el documento oficial.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
