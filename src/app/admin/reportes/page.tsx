"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  BookOpen,
  Loader2,
} from "lucide-react";
import { FormatoVisitaUTP, type FormatoVisitaUTPProps } from "@/components/Diseño/FormatoPDF/FormatoVisitaUTP";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";

const parseAsistenciaObs = (rawObs: string) => {
  if (!rawObs) return { alumnosAmbiente: "" as number | "", alumnosIntranet: "" as number | "", observaciones: "" };
  const match = rawObs.match(/^\[alumnos_ambiente:(\d*),alumnos_intranet:(\d*)\](.*)$/s);
  if (match) {
    return {
      alumnosAmbiente: match[1] === "" ? "" : parseInt(match[1], 10),
      alumnosIntranet: match[2] === "" ? "" : parseInt(match[2], 10),
      observaciones: match[3].trim()
    };
  }
  return { alumnosAmbiente: "" as number | "", alumnosIntranet: "" as number | "", observaciones: rawObs };
};

// -----------------------------------------------------------
// Interfaz para los registros de auditoría desde Supabase
// -----------------------------------------------------------
interface AuditRecord {
  id: string;
  aula: string;
  laboratorio: string;
  asignatura: string;
  docenteNombre: string;
  docenteId: string;
  auditorNombre: string;
  sedeFilial: string;
  ciclo: string;
  turno: string;
  fechaVisita: string;
  horaInicio: string;
  horaTermino: string;
  estado: "Cumplido" | "Pendiente" | "En progreso" | "Observada";
  semanaNo: string;
  campoFormativo: string;
  horasPracticaTeoria: string;
  requerimientosSolicitados: string;
  firmaDocenteUrl: string;
  firmaAuditorUrl: string;
  evidenciasFotos?: { id: number; url_foto: string; seccion: string }[];

  // Detalle de evaluaciones (se cargan bajo demanda)
  evalControl?: {
    presente_id: number | null;
    horario_id: number | null;
    interaccion_id: number | null;
    actividad_detalle: string | null;
    observaciones: string | null;
  } | null;
  evalAcademica?: {
    material_cumple_id: number | null;
    obs_material: string | null;
    silabo_coincide_actual_id: number | null;
    silabo_coincide_anterior_id: number | null;
    silabo_virtual_id: number | null;
    obs_avance_silabico: string | null;
  } | null;
  evalAsistencia?: {
    ambiente_cumple_id: number | null;
    intranet_cumple_id: number | null;
    observaciones: string | null;
  } | null;
  evalGuia?: {
    cumple_tema_id: number | null;
    evidencia_logro_id: number | null;
    cuenta_rubrica_id: number | null;
    observaciones: string | null;
  } | null;
}

// -----------------------------------------------------------
// Helpers: Mapeo de IDs de opciones_evaluacion a etiquetas
// Basado en los IDs usados en el wizard de inspecciones:
//   presente: 4=Presente/SI, 5=Ausente/NO
//   horario: 6=Puntual/Cumple, 7=Impuntual/No Cumple
//   interaccion: 8=Interactúa/SI, 9=No Interactúa/NO
//   cumple genérico: 1=CUMPLE, 2=NO CUMPLE, 3=NO APLICA
// -----------------------------------------------------------
const mapPresente = (id: number | null | undefined): "SI" | "NO" | "" => {
  if (id === 4) return "SI";
  if (id === 5) return "NO";
  return "";
};

const mapHorario = (id: number | null | undefined): "Cumple" | "No Cumple" | "" => {
  if (id === 6) return "Cumple";
  if (id === 7) return "No Cumple";
  return "";
};

const mapInteraccion = (id: number | null | undefined): "SI" | "NO" | "" => {
  if (id === 1) return "SI";
  if (id === 2) return "NO";
  return "";
};

const mapCumple = (id: number | null | undefined): "CUMPLE" | "NO CUMPLE" | "" => {
  if (id === 1) return "CUMPLE";
  if (id === 2) return "NO CUMPLE";
  return "";
};

const mapCumpleTriple = (id: number | null | undefined): "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "" => {
  if (id === 1) return "CUMPLE";
  if (id === 2) return "NO CUMPLE";
  if (id === 3) return "NO APLICA";
  return "";
};

const mapAmbienteCumple = (id: number | null | undefined): "Cumple" | "No cumple" | "" => {
  if (id === 1) return "Cumple";
  if (id === 2) return "No cumple";
  return "";
};

// Formato de fecha ISO (YYYY-MM-DD) a DD/MM/YYYY para el visor
const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr || "—";
  }
};

// Formato de hora (HH:MM:SS) a HH:MM
const formatTimeDisplay = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
};

// Mapear estado_id a texto legible
const mapEstado = (estadoId: number | null | undefined): "Cumplido" | "Pendiente" | "En progreso" | "Observada" => {
  if (estadoId === 1) return "Pendiente";
  if (estadoId === 2) return "En progreso";
  if (estadoId === 3) return "Cumplido";
  if (estadoId === 4) return "Observada";
  return "Pendiente";
};

// Firmas predeterminadas para Auditor y Admin (en formato SVG Base64)
const getPredefinedSignature = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("diana") || normalized.includes("auditora")) {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiPjxwYXRoIGQ9Ik0gMTAgMzAgUSAzMCAxMCA1MCAzMCBUIDkwIDMwIFQgMTMwIDMwIFQgMTcwIDMwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDMzYWEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPjxwYXRoIGQ9Ik0gMjAgNDAgUSA2MCAxNSAxMDAgMzUgVCAxNjAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMzNhYSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgLz48dGV4dCB4PSIyNSIgeT0iNTUiIGZvbnQtZmFtaWx5PSImYXBvcztCcnVzaCBTY3JpcHQgTVQmYXBvczssIGN1cnNpdmUsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMwMDMzYWEiPkRpYW5hIEF1ZGl0b3JhPC90ZXh0Pjwvc3ZnPg==";
  }
  if (normalized.includes("admin") || normalized.includes("administrador")) {
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiPjxwYXRoIGQ9Ik0gMTUgMjUgUSAzNSA1IDYwIDM1IFQgMTEwIDI1IFQgMTUwIDM1IFQgMTgwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxMTIyODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPjxwYXRoIGQ9Ik0gMjUgMzUgUSA3NSAxMCAxMTUgMzAgVCAxNzUgMTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzExMjI4OCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgLz48dGV4dCB4PSMzNSIgeT0iNTIiIGZvbnQtZmFtaWx5PSImYXBvcztCcnVzaCBTY3JpcHQgTVQmYXBvczssIGN1cnNpdmUsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMxMTIyODgiPkFkbWluaXN0cmFkb3I8L3RleHQ+PC9zdmc+";
  }
  return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMzYiPjxwYXRoIGQ9Ik0gMTAgMzAgUSAzMCAxMCA1MCAzMCBUIDkwIDMwIFQgMTMwIDMwIFQgMTcwIDMwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDMzYWEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPjxwYXRoIGQ9Ik0gMjAgNDAgUSA2MCAxNSAxMDAgMzUgVCAxNjAgMjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMzNhYSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgLz48dGV4dCB4PSIyNSIgeT0iNTUiIGZvbnQtZmFtaWx5PSImYXBvcztCcnVzaCBTY3JpcHQgTVQmYXBvczssIGN1cnNpdmUsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMwMDMzYWEiPkRpYW5hIEF1ZGl0b3JhPC90ZXh0Pjwvc3ZnPg==";
};

export default function ReportesPage() {
  const { user, loading } = useAuth();
  const supabase = createClient();

  // --- Estado ---
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sedeFilter, setSedeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [templateMode, setTemplateMode] = useState<"filled" | "empty">("filled");
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [expandedAulas, setExpandedAulas] = useState<Record<string, boolean>>({});
  const [checkedAuditIds, setCheckedAuditIds] = useState<string[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);

  const ROL_ACTIVO = user?.rol;
  const currentUser = user;

  // --- Cargar sedes desde Supabase para los filtros dinámicos ---
  const fetchSedes = useCallback(async () => {
    const { data } = await supabase.from("sedes").select("id, nombre").order("nombre");
    if (data) setSedes(data);
  }, [supabase]);

  // --- Cargar las visitas y sus evaluaciones desde Supabase ---
  const fetchAudits = useCallback(async () => {
    setLoadingAudits(true);
    try {
      // Traer todas las visitas con sus relaciones
      let query = supabase
        .from("visitas")
        .select(`
          id,
          fecha_visita,
          hora_inicio_real,
          hora_termino_real,
          ciclo,
          turno,
          semana_nro,
          estado_id,
          campo_formativo,
          horas_teoria_practica,
          requerimientos_solicitados,
          firma_docente_b64,
          firma_auditor_b64,
          ultimo_paso_completado,
          sedes(id, nombre),
          aulas(nombre),
          asignaturas(nombre),
          docente:usuarios!visitas_docente_id_fkey(id, nombres, apellidos),
          auditor:usuarios!visitas_auditor_id_fkey(id, nombres, apellidos),
          eval_control_docente(presente_id, horario_id, interaccion_id, actividad_detalle, observaciones),
          eval_academica_detalle(material_cumple_id, obs_material, silabo_coincide_actual_id, silabo_coincide_anterior_id, silabo_virtual_id, obs_avance_silabico),
          eval_asistencia(ambiente_cumple_id, intranet_cumple_id, observaciones),
          eval_guia_practica(cumple_tema_id, evidencia_logro_id, cuenta_rubrica_id, observaciones),
          evidencias_fotos(id, url_foto, seccion)
        `)
        .is("deleted_at", null);

      if (currentUser?.rol === "Auditor") {
        query = query.eq("auditor_id", parseInt(currentUser.id, 10));
      } else if (currentUser?.rol === "Docente") {
        query = query.eq("docente_id", parseInt(currentUser.id, 10));
      }

      const { data: visitas, error } = await query.order("id", { ascending: false });

      if (error) {
        console.error("Error al cargar visitas para reportes:", error);
        setLoadingAudits(false);
        return;
      }

      if (!visitas) {
        setAudits([]);
        setLoadingAudits(false);
        return;
      }

      const mapped: AuditRecord[] = visitas.map((v: any) => {
        const docenteNombres = v.docente?.nombres || "";
        const docenteApellidos = v.docente?.apellidos || "";
        const docenteNombre = `${docenteNombres} ${docenteApellidos}`.trim() || "Docente sin asignar";

        const auditorNombres = v.auditor?.nombres || "";
        const auditorApellidos = v.auditor?.apellidos || "";
        let auditorNombre = `${auditorNombres} ${auditorApellidos}`.trim();
        if (!auditorNombre && v.auditor?.id === 9) {
          auditorNombre = "Administrador";
        } else if (!auditorNombre) {
          auditorNombre = "Diana Auditora";
        }

        // Relaciones 1:1 representadas por arrays en PostgREST
        const evalControl = Array.isArray(v.eval_control_docente)
          ? v.eval_control_docente[0]
          : (v.eval_control_docente || null);
        const evalAcademica = Array.isArray(v.eval_academica_detalle)
          ? v.eval_academica_detalle[0]
          : (v.eval_academica_detalle || null);
        const evalAsistencia = Array.isArray(v.eval_asistencia)
          ? v.eval_asistencia[0]
          : (v.eval_asistencia || null);
        const evalGuia = Array.isArray(v.eval_guia_practica)
          ? v.eval_guia_practica[0]
          : (v.eval_guia_practica || null);

        const hasEvidence = v.evidencias_fotos && v.evidencias_fotos.length > 0;
        const hasTeacherSignature = v.firma_docente_b64 && v.firma_docente_b64.trim() !== "";
        const step = v.ultimo_paso_completado || 1;

        let effectiveEstadoId = v.estado_id;
        if (step < 7) {
          effectiveEstadoId = 2; // En progreso
        } else {
          if (!hasTeacherSignature) {
            effectiveEstadoId = 1; // Pendiente
          } else {
            effectiveEstadoId = hasEvidence ? 3 : 4; // Completada u Observada
          }
        }

        return {
          id: v.id.toString(),
          aula: v.aulas?.nombre || "Aula no asignada",
          laboratorio: v.aulas?.nombre || "",
          asignatura: v.asignaturas?.nombre || "Asignatura no asignada",
          docenteNombre,
          docenteId: v.docente?.id?.toString() || "",
          auditorNombre,
          sedeFilial: v.sedes?.nombre || "Sede no asignada",
          ciclo: v.ciclo || "",
          turno: v.turno || "",
          fechaVisita: formatDateDisplay(v.fecha_visita),
          horaInicio: formatTimeDisplay(v.hora_inicio_real) || (v.turno === "Noche" ? "18:30" : v.turno === "Tarde" ? "14:00" : "08:00"),
          horaTermino: formatTimeDisplay(v.hora_termino_real) || (v.turno === "Noche" ? "20:00" : v.turno === "Tarde" ? "15:30" : "09:30"),
          estado: mapEstado(effectiveEstadoId),
          semanaNo: v.semana_nro?.toString() || "",
          campoFormativo: v.campo_formativo || "Ingeniería de Software / Tecnologías de la Información",
          horasPracticaTeoria: v.horas_teoria_practica || (v.turno === "Noche" ? "Teoría y Práctica Integrada" : "Práctica de Laboratorio"),
          requerimientosSolicitados: v.requerimientos_solicitados || "",
          firmaDocenteUrl: v.firma_docente_b64 || "",
          firmaAuditorUrl: v.firma_auditor_b64 || "",
          evidenciasFotos: v.evidencias_fotos || [],
          evalControl,
          evalAcademica,
          evalAsistencia,
          evalGuia,
        };
      });

      // Si el rol es Docente, filtrar solo las visitas del docente actual
      const finalAudits = ROL_ACTIVO === "Docente"
        ? mapped.filter((a) => a.docenteId === currentUser.id)
        : mapped;

      setAudits(finalAudits);
    } catch (err) {
      console.error("Error al cargar auditorías:", err);
    } finally {
      setLoadingAudits(false);
    }
  }, [supabase, ROL_ACTIVO, currentUser?.id]);

  // --- Efectos ---
  useEffect(() => {
    if (user) {
      fetchAudits();
      fetchSedes();
    }
  }, [fetchAudits, fetchSedes, user]);

  // --- Filtrado reactivo en cliente ---
  const filteredAudits = React.useMemo(() => {
    return audits.filter((audit) => {
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
        (stateFilter === "pendiente" && audit.estado === "Pendiente") ||
        (stateFilter === "en_progreso" && audit.estado === "En progreso") ||
        (stateFilter === "observada" && audit.estado === "Observada");

      // Filtrar por rango de fechas (la fecha está en DD/MM/YYYY)
      if (startDate || endDate) {
        const parts = audit.fechaVisita.split("/");
        if (parts.length === 3) {
          const auditDate = new Date(
            parseInt(parts[2], 10),
            parseInt(parts[1], 10) - 1,
            parseInt(parts[0], 10)
          );

          if (startDate) {
            const sParts = startDate.split("-");
            const start = new Date(parseInt(sParts[0], 10), parseInt(sParts[1], 10) - 1, parseInt(sParts[2], 10));
            if (auditDate < start) return false;
          }
          if (endDate) {
            const eParts = endDate.split("-");
            const end = new Date(parseInt(eParts[0], 10), parseInt(eParts[1], 10) - 1, parseInt(eParts[2], 10));
            if (auditDate > end) return false;
          }
        }
      }

      return matchesSearch && matchesSede && matchesState;
    });
  }, [audits, searchTerm, sedeFilter, stateFilter, startDate, endDate]);

  // --- Agrupamiento por aula ---
  const groupedAudits = React.useMemo(() => {
    const groups: Record<string, AuditRecord[]> = {};
    filteredAudits.forEach((audit) => {
      const key = audit.aula;
      if (!groups[key]) groups[key] = [];
      groups[key].push(audit);
    });
    return groups;
  }, [filteredAudits]);

  // --- Limpiar selecciones que desaparecen por filtro ---
  useEffect(() => {
    const visibleIds = new Set(filteredAudits.map((a) => a.id));
    setCheckedAuditIds((prev) => {
      const next = prev.filter((id) => visibleIds.has(id));
      if (next.length !== prev.length) {
        return next;
      }
      return prev;
    });
  }, [filteredAudits]);

  // --- Loading guard ---
  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-60 bg-white/5 rounded-lg w-full" />
      </div>
    );
  }

  // --- Handlers de selección ---
  const toggleAulaExpand = (aula: string) => {
    setExpandedAulas((prev) => ({ ...prev, [aula]: !prev[aula] }));
  };

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

  const handleDownloadPDF = async () => {
    if (checkedAuditIds.length === 0) return;
    const html2pdf = (await import("html2pdf.js")).default;

    if (checkedAuditIds.length === 1) {
      // Descarga individual
      const id = checkedAuditIds[0];
      const element = document.getElementById(`report-card-${id}`);
      if (!element) return;

      const audit = audits.find((a) => a.id === id);
      const filename = audit
        ? `Ficha_Visita_${audit.sedeFilial.split(" - ")[0]}_${audit.aula}_${audit.fechaVisita.replace(/\//g, "-")}.pdf`
        : `Reporte_Visita_${id}.pdf`;

      // Clonar y envolver para quitar márgenes y sombreado en PDF
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.boxShadow = "none";
      clone.style.borderRadius = "0";
      clone.style.margin = "0";
      clone.style.padding = "0";
      clone.style.display = "block";

      const wrapper = document.createElement("div");
      wrapper.className = "pdf-capture-wrapper";
      wrapper.appendChild(clone);

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg" as const, quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["css" as const, "legacy" as const] },
      };

      html2pdf().from(wrapper).set(opt).save();
    } else {
      // Descarga conjunta en un único archivo PDF multipágina
      const container = document.createElement("div");
      container.className = "pdf-capture-wrapper";

      for (const id of checkedAuditIds) {
        const element = document.getElementById(`report-card-${id}`);
        if (!element) continue;

        // Clonar para no alterar la vista actual del DOM
        const clone = element.cloneNode(true) as HTMLElement;
        // Remover estilos de sombreado y bordes del contenedor en pantalla para el PDF
        clone.style.boxShadow = "none";
        clone.style.borderRadius = "0";
        clone.style.margin = "0";
        clone.style.padding = "0";
        clone.style.display = "block";

        container.appendChild(clone);
      }

      const filename = `Reporte_Conjunto_Visitas_${new Date().toISOString().split("T")[0]}.pdf`;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg" as const, quality: 1.0 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
        pagebreak: { mode: ["css" as const, "legacy" as const] },
      };

      html2pdf().from(container).set(opt).save();
    }
  };

  // --- Transformar un AuditRecord a props de FormatoVisitaUTP ---
  const getReportData = (audit: AuditRecord): FormatoVisitaUTPProps => {
    if (templateMode === "empty") return {};

    const ec = audit.evalControl;
    const ea = audit.evalAcademica;
    const eas = audit.evalAsistencia;
    const eg = audit.evalGuia;

    const parsedAsistencia = parseAsistenciaObs(eas?.observaciones || "");

    return {
      fechaVisita: audit.fechaVisita,
      horaInicio: audit.horaInicio,
      horaTermino: audit.horaTermino,
      sedeFilial: audit.sedeFilial,
      ciclo: audit.ciclo,
      turno: audit.turno,
      asignatura: audit.asignatura,
      campoFormativo: audit.campoFormativo,
      semanaNo: audit.semanaNo,
      horaPracticaTeoria: audit.horasPracticaTeoria,
      lugarVisita: audit.aula,

      // Sección 1: Control Docente
      docenteNombre: audit.docenteNombre,
      docentePresente: mapPresente(ec?.presente_id),
      horarioProgramado: mapHorario(ec?.horario_id),
      interaccion: mapInteraccion(ec?.interaccion_id),
      actividad: ec?.actividad_detalle || "",
      obs1: ec?.observaciones || "",

      // Sección 2: Material Aula Virtual
      materialCargado: mapCumple(ea?.material_cumple_id),
      obs2: ea?.obs_material || "",

      // Sección 3: Asistencia
      asistenciaAmbiente: mapAmbienteCumple(eas?.ambiente_cumple_id),
      asistenciaAmbienteObs: parsedAsistencia.alumnosAmbiente !== "" ? `${parsedAsistencia.alumnosAmbiente} alumnos` : "",
      asistenciaIntranet: mapAmbienteCumple(eas?.intranet_cumple_id),
      asistenciaIntranetObs: parsedAsistencia.alumnosIntranet !== "" ? `${parsedAsistencia.alumnosIntranet} alumnos` : "",
      obs3: parsedAsistencia.observaciones,

      // Sección 4: Avance Silábico
      silaboCoincide: mapCumple(ea?.silabo_coincide_actual_id),
      temaAnteriorCoincide: mapCumple(ea?.silabo_coincide_anterior_id),
      ingresoSilaboVirtual: mapCumple(ea?.silabo_virtual_id),
      obs4: ea?.obs_avance_silabico || "",

      // Sección 5: Guía de Práctica
      guiaPractica: mapCumpleTriple(eg?.cumple_tema_id),
      logroMedir: mapCumpleTriple(eg?.evidencia_logro_id),
      rubricaEvaluacion: mapCumpleTriple(eg?.cuenta_rubrica_id),
      obs5: eg?.observaciones || "",

      // Pie del reporte
      responsableActividad: audit.auditorNombre || "",
      requerimientosSolicitados: audit.requerimientosSolicitados,
      firmaDocenteUrl: audit.firmaDocenteUrl,
      firmaResponsableUrl: audit.firmaAuditorUrl || (() => {
        if (typeof window !== "undefined" && user?.id) {
          const localSig = localStorage.getItem(`sivac_signature_user_${user.id}`);
          if (localSig && user.nombres && audit.auditorNombre.toLowerCase().includes(user.nombres.toLowerCase())) {
            return localSig;
          }
        }
        return getPredefinedSignature(audit.auditorNombre);
      })(),
      evidenciasFotos: audit.evidenciasFotos || [],
    };
  };

  // --- Render ---
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
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.nombre}>
                      {sede.nombre}
                    </option>
                  ))}
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
                  <option value="en_progreso">En progreso</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="observada">Observada</option>
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

        {/* Lista de visitas agrupadas por Aula */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingAudits ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 size={28} className="text-sivac-blue animate-spin" />
              <p className="text-12 text-sivac-muted">Cargando visitas desde la base de datos...</p>
            </div>
          ) : Object.keys(groupedAudits).length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <BookOpen className="mx-auto text-sivac-dim" size={28} />
              <p className="text-13 text-sivac-muted font-medium">No se encontraron visitas</p>
              <p className="text-11 text-sivac-dim">Prueba ajustando el texto o los filtros de búsqueda.</p>
            </div>
          ) : (
            Object.entries(groupedAudits).map(([aula, aulaAudits]) => {
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
                        {aulaAudits.length} {aulaAudits.length === 1 ? "reporte" : "reportes"}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-sivac-muted transition-transform duration-200 ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                  </button>

                  {/* Classroom Reports Cards List */}
                  {isExpanded && (
                    <div className="space-y-2.5 pl-3 border-l border-sivac-border-glass">
                      {aulaAudits.map((audit) => {
                        const isChecked = checkedAuditIds.includes(audit.id);
                        const isPending = audit.estado === "Pendiente";
                        const isInProgress = audit.estado === "En progreso";

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
                                  <p className="text-11 text-sivac-muted">{audit.laboratorio || audit.aula}</p>
                                </div>
                              </div>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                                  isPending
                                    ? "bg-sivac-yellow/10 text-sivac-yellow-soft border border-sivac-yellow/20"
                                    : isInProgress
                                      ? "bg-sivac-blue/10 text-sivac-blue-light border border-sivac-blue/20"
                                      : audit.estado === "Observada"
                                        ? "bg-sivac-red/10 text-sivac-red-light border border-sivac-red/20"
                                        : "bg-sivac-green/10 text-sivac-green-light border border-sivac-green/20"
                                }`}
                              >
                                {isPending || isInProgress ? <Clock size={8} /> : <CheckCircle2 size={8} />}
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
              onClick={handleDownloadPDF}
              className="h-[36px] px-3 border border-sivac-border-card hover:bg-sivac-bg-secondary text-sivac-body hover:text-sivac-heading rounded-lg transition-colors flex items-center justify-center gap-1 text-12"
              title="Descargar PDF Directo"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Contenedor del papel (Con fondo gris oscuro para emular hoja física en pantalla oscura) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center gap-8 bg-gray-900/60 print:bg-white print:p-0 print:gap-0">
          {checkedAuditIds.length > 0 ? (
            checkedAuditIds.map((id) => {
              const audit = audits.find((a) => a.id === id);
              if (!audit) return null;
              const data = getReportData(audit);
              return (
                <div
                  key={audit.id}
                  id={`report-card-${audit.id}`}
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
