"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Eye, Edit2, ChevronLeft, ChevronRight, Check, X, Play, FileDown, Trash2, Loader2, Camera } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { FormatoVisitaUTP } from "@/components/Diseño/FormatoPDF/FormatoVisitaUTP";

interface Visit {
  id: string;
  status: "green" | "yellow" | "gray" | "red";
  statusText: string;
  fecha: string;
  docente: string;
  sede: string;
  sedeId: number | null;
  aula: string;
  semana: number;
  hasEvidence: boolean;
  estadoId: number;
  auditorId?: number | null;
}


const PAGE_SIZE = 10;

export default function VisitasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = createClient();

  
  const [allVisits, setAllVisits] = React.useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(true);

  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sedeFilter, setSedeFilter] = React.useState("all");
  const [estadoFilter, setEstadoFilter] = React.useState("all");

  
  const [sedes, setSedes] = React.useState<{ id: number; nombre: string }[]>([]);

  
  const [currentPage, setCurrentPage] = React.useState(1);

  
  const [selectedAudit, setSelectedAudit] = React.useState<any | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);
  const [loadingPdfId, setLoadingPdfId] = React.useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = React.useState<string | null>(null);
  const [tempAuditToDownload, setTempAuditToDownload] = React.useState<any | null>(null);

  
  const fetchSedes = React.useCallback(async () => {
    const { data } = await supabase.from("sedes").select("id, nombre").order("nombre");
    if (data) setSedes(data);
  }, [supabase]);

  
  React.useEffect(() => {
    if (!tempAuditToDownload) return;
    
    const triggerDownload = async () => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById(`pdf-download-element-${tempAuditToDownload.id}`);
        if (element) {
          const opt = {
            margin: 0,
            filename: `Ficha_Visita_${tempAuditToDownload.sedeFilial.split(" - ")[0]}_${tempAuditToDownload.aula}_${tempAuditToDownload.fechaVisita.replace(/\//g, "-")}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
            pagebreak: { mode: ["css" as const, "legacy" as const] },
          };
          await html2pdf().from(element).set(opt).save();
        }
      } catch (err) {
        console.error("Error al generar PDF:", err);
      } finally {
        setTempAuditToDownload(null);
      }
    };

    const timer = setTimeout(() => {
      triggerDownload();
    }, 300);

    return () => clearTimeout(timer);
  }, [tempAuditToDownload]);

  const fetchCompleteVisit = async (visitaId: string) => {
    try {
      const { data: v, error } = await supabase
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
        .eq("id", parseInt(visitaId, 10))
        .maybeSingle();

      if (error || !v) {
        console.error("Error fetching complete visit:", error);
        return null;
      }

      const docenteObj: any = Array.isArray(v.docente) ? v.docente[0] : v.docente;
      const docenteNombres = docenteObj?.nombres || "";
      const docenteApellidos = docenteObj?.apellidos || "";
      const docenteNombre = `${docenteNombres} ${docenteApellidos}`.trim() || "Docente sin asignar";

      const auditorObj: any = Array.isArray(v.auditor) ? v.auditor[0] : v.auditor;
      const auditorNombres = auditorObj?.nombres || "";
      const auditorApellidos = auditorObj?.apellidos || "";
      let auditorNombre = `${auditorNombres} ${auditorApellidos}`.trim();
      if (!auditorNombre && auditorObj?.id === 9) {
        auditorNombre = "Administrador";
      } else if (!auditorNombre) {
        auditorNombre = "Diana Auditora";
      }

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
        effectiveEstadoId = 2; 
      } else {
        if (!hasTeacherSignature) {
          effectiveEstadoId = 1; 
        } else {
          effectiveEstadoId = hasEvidence ? 3 : 4; 
        }
      }

      const aulasObj: any = Array.isArray(v.aulas) ? v.aulas[0] : v.aulas;
      const asignaturasObj: any = Array.isArray(v.asignaturas) ? v.asignaturas[0] : v.asignaturas;
      const sedesObj: any = Array.isArray(v.sedes) ? v.sedes[0] : v.sedes;

      return {
        id: v.id.toString(),
        aula: aulasObj?.nombre || "Aula no asignada",
        laboratorio: aulasObj?.nombre || "",
        asignatura: asignaturasObj?.nombre || "Asignatura no asignada",
        docenteNombre,
        docenteId: docenteObj?.id?.toString() || "",
        auditorNombre,
        sedeFilial: sedesObj?.nombre || "Sede no asignada",
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
    } catch (err) {
      console.error("Error fetching complete visit:", err);
      return null;
    }
  };

  const handleVerDetalles = async (visitaId: string) => {
    setLoadingPdfId(visitaId);
    try {
      const record = await fetchCompleteVisit(visitaId);
      if (record) {
        setSelectedAudit(record);
        setIsPdfModalOpen(true);
      }
    } finally {
      setLoadingPdfId(null);
    }
  };

  const handleDescargarPDF = async (visitaId: string) => {
    setDownloadingPdfId(visitaId);
    try {
      const record = await fetchCompleteVisit(visitaId);
      if (record) {
        setTempAuditToDownload(record);
      }
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const getReportData = (audit: any) => {
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

      
      docenteNombre: audit.docenteNombre,
      docentePresente: mapPresente(ec?.presente_id),
      horarioProgramado: mapHorario(ec?.horario_id),
      interaccion: mapInteraccion(ec?.interaccion_id),
      actividad: ec?.actividad_detalle || "",
      obs1: ec?.observaciones || "",

      
      materialCargado: mapCumple(ea?.material_cumple_id),
      obs2: ea?.obs_material || "",

      
      asistenciaAmbiente: mapAmbienteCumple(eas?.ambiente_cumple_id),
      asistenciaAmbienteObs: parsedAsistencia.alumnosAmbiente !== "" ? `${parsedAsistencia.alumnosAmbiente} alumnos` : "",
      asistenciaIntranet: mapAmbienteCumple(eas?.intranet_cumple_id),
      asistenciaIntranetObs: parsedAsistencia.alumnosIntranet !== "" ? `${parsedAsistencia.alumnosIntranet} alumnos` : "",
      obs3: parsedAsistencia.observaciones,

      
      silaboCoincide: mapCumple(ea?.silabo_coincide_actual_id),
      temaAnteriorCoincide: mapCumple(ea?.silabo_coincide_anterior_id),
      ingresoSilaboVirtual: mapCumple(ea?.silabo_virtual_id),
      obs4: ea?.obs_avance_silabico || "",

      
      guiaPractica: mapCumpleTriple(eg?.cumple_tema_id),
      logroMedir: mapCumpleTriple(eg?.evidencia_logro_id),
      rubricaEvaluacion: mapCumpleTriple(eg?.cuenta_rubrica_id),
      obs5: eg?.observaciones || "",

      
      responsableActividad: audit.auditorNombre || "",
      requerimientosSolicitados: audit.requerimientosSolicitados,
      firmaDocenteUrl: audit.firmaDocenteUrl,
      firmaResponsableUrl: audit.firmaAuditorUrl || (() => {
        if (typeof window !== "undefined" && user?.id) {
          const localSig = localStorage.getItem(`sivac_signature_user_${user.id}`);
          if (localSig && user.nombre && audit.auditorNombre.toLowerCase().includes(user.nombre.toLowerCase())) {
            return localSig;
          }
        }
        return "";
      })(),
      evidenciasFotos: audit.evidenciasFotos || [],
    };
  };

  
  const fetchVisitas = React.useCallback(async () => {
    if (!user) return;
    setLoadingVisits(true);
    try {
      let query = supabase
        .from("visitas")
        .select(`
          id,
          fecha_visita,
          ciclo,
          turno,
          semana_nro,
          estado_id,
          sede_id,
          auditor_id,
          ultimo_paso_completado,
          firma_docente_b64,
          requerimientos_solicitados,
          sedes(id, nombre),
          aulas(nombre),
          docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
          evidencias_fotos(id)
        `)
        .is("deleted_at", null);

      
      if (user.rol === "Auditor") {
        query = query.eq("auditor_id", parseInt(user.id, 10));
      } else if (user.rol === "Docente") {
        query = query.eq("docente_id", parseInt(user.id, 10));
      }

      const { data: dbVisits, error } = await query.order("id", { ascending: false });

      if (error) {
        console.error("Error fetching visitas:", error);
        setLoadingVisits(false);
        return;
      }

      if (dbVisits) {
        const mappedVisits: Visit[] = dbVisits.map((item: any) => {
          const hasEvidence = item.evidencias_fotos && item.evidencias_fotos.length > 0;
          const hasTeacherSignature = item.firma_docente_b64 && item.firma_docente_b64.trim() !== "";
          const step = item.ultimo_paso_completado || 1;

          
          let effectiveEstadoId = item.estado_id;
          if (step < 7) {
            effectiveEstadoId = 2; 
          } else {
            if (!hasTeacherSignature) {
              effectiveEstadoId = 1; 
            } else {
              effectiveEstadoId = hasEvidence ? 3 : 4; 
            }
          }

          let status: "green" | "yellow" | "gray" | "red" = "gray";
          let statusText = "Pendiente";

          if (effectiveEstadoId === 2) {
            status = "yellow";
            statusText = "En progreso";
          } else if (effectiveEstadoId === 3) {
            status = "green";
            statusText = "Completada";
          } else if (effectiveEstadoId === 4) {
            status = "red";
            statusText = "Observada";
          }

          return {
            id: item.id.toString(),
            status,
            statusText,
            fecha: item.fecha_visita || "—",
            docente: `${item.docente?.nombres || ""} ${item.docente?.apellidos || ""}`.trim() || "Docente sin asignar",
            sede: item.sedes?.nombre ? item.sedes.nombre.replace(" (Inactivo)", "") : "—",
            sedeId: item.sedes?.id || item.sede_id || null,
            aula: item.aulas?.nombre ? item.aulas.nombre.replace(" (Inactivo)", "") : "—",
            semana: item.semana_nro || 1,
            hasEvidence: !!hasEvidence,
            estadoId: effectiveEstadoId || 1,
            auditorId: item.auditor_id || null,
          };
        });

        setAllVisits(mappedVisits);
      }
    } catch (err) {
      console.error("Error al cargar las visitas:", err);
    } finally {
      setLoadingVisits(false);
    }
  }, [supabase, user]);

  
  const handleDeleteVisita = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta visita de auditoría?")) return;
    try {
      const { error } = await supabase
        .from("visitas")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", parseInt(id, 10));

      if (error) {
        alert("No se pudo eliminar la visita: " + error.message);
      } else {
        setAllVisits((prev) => prev.filter((v) => Number(v.id) !== Number(id)));
      }
    } catch (err) {
      console.error("Error al eliminar la visita:", err);
    }
  };

  
  React.useEffect(() => {
    if (user) {
      fetchVisitas();
      fetchSedes();
    }
  }, [fetchVisitas, fetchSedes, user]);

  
  const filteredVisits = React.useMemo(() => {
    return allVisits.filter((visit) => {
      
      const matchesSearch =
        searchTerm === "" ||
        visit.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `Semana ${visit.semana}`.toLowerCase().includes(searchTerm.toLowerCase());

      
      const matchesSede =
        sedeFilter === "all" || visit.sede === sedeFilter;

      
      const matchesEstado =
        estadoFilter === "all" ||
        (estadoFilter === "1" && visit.estadoId === 1) ||
        (estadoFilter === "2" && visit.estadoId === 2) ||
        (estadoFilter === "3" && visit.estadoId === 3) ||
        (estadoFilter === "4" && visit.estadoId === 4);

      return matchesSearch && matchesSede && matchesEstado;
    });
  }, [allVisits, searchTerm, sedeFilter, estadoFilter]);

  
  const totalVisits = filteredVisits.length;
  const totalPages = Math.max(1, Math.ceil(totalVisits / PAGE_SIZE));

  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sedeFilter, estadoFilter]);

  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-40 bg-white/5 rounded-lg w-full" />
      </div>
    );
  }

  const ROL_ACTIVO = user.rol;

  
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedVisits = filteredVisits.slice(startIndex, endIndex);

  
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loadingVisits) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-24 font-bold font-poppins text-sivac-light">
              Gestión de Visitas
            </h1>
            <p className="text-14 font-normal text-sivac-body mt-1">
              Administra, filtra y consulta todas las visitas de auditoría programadas y realizadas.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 size={28} className="text-sivac-blue animate-spin" />
          <p className="text-13 text-sivac-muted">Cargando visitas desde la base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-24 font-bold font-poppins text-sivac-light">
            Gestión de Visitas
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Administra, filtra y consulta todas las visitas de auditoría programadas y realizadas.
          </p>
        </div>

        {(ROL_ACTIVO === "Admin" || ROL_ACTIVO === "Auditor") && (
          <button
            type="button"
            onClick={() => router.push("?newInspection=true")}
            className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Nueva Visita</span>
          </button>
        )}
      </div>

      {}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-sivac-bg-secondary/40 p-4 rounded-lg border border-sivac-border-card">
        {}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sivac-muted">
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Buscar docente, aula o semana..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-admin w-full h-[40px] pl-10 pr-4 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted"
          />
        </div>

        {}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {}
          <select
            value={sedeFilter}
            onChange={(e) => setSedeFilter(e.target.value)}
            className="h-[40px] px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-body outline-none focus:border-sivac-blue cursor-pointer"
          >
            <option value="all">Sede: Todas</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.nombre}>
                {sede.nombre}
              </option>
            ))}
          </select>

          {}
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-[40px] px-3.5 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-body outline-none focus:border-sivac-blue cursor-pointer"
          >
            <option value="all">Estado: Todos</option>
            <option value="1">Pendiente</option>
            <option value="2">En progreso</option>
            <option value="3">Completada</option>
            <option value="4">Observada</option>
          </select>
        </div>
      </div>

      {}
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
                  AULA
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                  SEMANA
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase text-center">
                  EVIDENCIA
                </th>
                <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase text-center">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sivac-border-card">
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-14 text-sivac-muted font-medium">
                        {searchTerm || sedeFilter !== "all" || estadoFilter !== "all"
                          ? "No se encontraron visitas con los filtros aplicados."
                          : "No hay visitas registradas."}
                      </p>
                      {(searchTerm || sedeFilter !== "all" || estadoFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            setSedeFilter("all");
                            setEstadoFilter("all");
                          }}
                          className="text-12 text-sivac-indigo hover:text-sivac-blue-light font-semibold transition-colors underline underline-offset-2"
                        >
                          Limpiar todos los filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedVisits.map((visit) => (
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
                      {visit.aula}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data font-semibold text-sivac-light">
                      Semana {visit.semana}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/evidencias?visitaId=${visit.id}`)}
                          className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                          title={visit.hasEvidence ? "Ver evidencias fotográficas" : "Cargar evidencias fotográficas"}
                        >
                          {visit.hasEvidence ? (
                            <Check size={20} className="text-sivac-green-light bg-sivac-green/10 p-0.5 rounded" />
                          ) : (
                            <X size={20} className="text-sivac-red-light bg-sivac-red/10 p-0.5 rounded" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {(ROL_ACTIVO === "Docente" || (user && Number(visit.auditorId) !== Number(user.id))) && (visit.status === "gray" || visit.status === "yellow") && (
                          <span className="text-sivac-muted text-14 font-medium">—</span>
                        )}

                        {visit.status === "gray" && ROL_ACTIVO !== "Docente" && user && Number(visit.auditorId) === Number(user.id) && (
                          
                          <button
                            type="button"
                            className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                            title="Iniciar inspección"
                            onClick={() => router.push(`/admin/inspecciones?visitaId=${visit.id}`)}
                          >
                            <Play size={18} strokeWidth={2} />
                          </button>
                        )}

                        {visit.status === "yellow" && ROL_ACTIVO !== "Docente" && user && Number(visit.auditorId) === Number(user.id) && (
                          
                          <>
                            <button
                              type="button"
                              className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                              title="Continuar inspección"
                              onClick={() => router.push(`/admin/inspecciones?visitaId=${visit.id}`)}
                            >
                              <Play size={18} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 text-sivac-muted hover:text-sivac-yellow transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                              title="Editar inspección"
                              onClick={() => router.push(`/admin/inspecciones?visitaId=${visit.id}`)}
                            >
                              <Edit2 size={18} strokeWidth={2} />
                            </button>
                          </>
                        )}

                        {(visit.status === "green" || visit.status === "red") && (
                          
                          <>
                            {ROL_ACTIVO !== "Docente" && (
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/evidencias?visitaId=${visit.id}`)}
                                className="p-1.5 text-sivac-muted hover:text-sivac-indigo transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                                title="Ver evidencias fotográficas"
                              >
                                <Camera size={18} strokeWidth={2} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleVerDetalles(visit.id)}
                              disabled={loadingPdfId !== null || downloadingPdfId !== null}
                              className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer disabled:opacity-40"
                              title="Ver detalles"
                            >
                              {loadingPdfId === visit.id ? (
                                <Loader2 size={18} className="animate-spin text-sivac-blue" />
                              ) : (
                                <Eye size={18} strokeWidth={2} />
                              )}
                            </button>
                            {ROL_ACTIVO !== "Docente" && (
                              <button
                                type="button"
                                onClick={() => handleDescargarPDF(visit.id)}
                                disabled={loadingPdfId !== null || downloadingPdfId !== null}
                                className="p-1.5 text-sivac-muted hover:text-sivac-indigo-light transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer disabled:opacity-40"
                                title="Descargar PDF"
                              >
                                {downloadingPdfId === visit.id ? (
                                  <Loader2 size={18} className="animate-spin text-sivac-indigo" />
                                ) : (
                                  <FileDown size={18} strokeWidth={2} />
                                )}
                              </button>
                            )}
                            {ROL_ACTIVO === "Admin" && (
                              <button
                                type="button"
                                onClick={() => handleDeleteVisita(visit.id)}
                                className="p-1.5 text-sivac-muted hover:text-sivac-red transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                                title="Eliminar visita"
                              >
                                <Trash2 size={18} strokeWidth={2} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {}
        <div className="px-6 py-4 flex items-center justify-between border-t border-sivac-border-card bg-sivac-bg-secondary/10">
          <p className="text-12 font-normal text-sivac-muted">
            Mostrando{" "}
            <span className="font-semibold text-sivac-light">
              {totalVisits === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, totalVisits)}
            </span>{" "}
            de <span className="font-semibold text-sivac-light">{totalVisits}</span> visitas
          </p>

          <div className="flex items-center gap-1.5">
            {}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={`p-1.5 rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary transition-colors ${
                safePage <= 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </button>

            {}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-12 font-semibold transition-colors cursor-pointer ${
                  pageNum === safePage
                    ? "bg-sivac-blue text-sivac-surface font-bold"
                    : "border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={`p-1.5 rounded-lg border border-sivac-border-card text-sivac-muted hover:text-sivac-light hover:bg-sivac-bg-secondary transition-colors ${
                safePage >= totalPages ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {}
      {tempAuditToDownload && (
        <div 
          style={{
            position: "fixed",
            left: "-9999px",
            top: "-9999px",
            width: "210mm",
            overflow: "hidden",
            pointerEvents: "none"
          }}
        >
          <div 
            id={`pdf-download-element-${tempAuditToDownload.id}`}
            className="pdf-capture-wrapper"
            style={{
              width: "210mm",
              backgroundColor: "#ffffff",
              color: "#000000",
              opacity: 1
            }}
          >
            <FormatoVisitaUTP {...getReportData(tempAuditToDownload)} />
          </div>
        </div>
      )}

      {}
      {isPdfModalOpen && selectedAudit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface border border-sivac-border-card rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative backdrop-blur-xl">
            
            {}
            <div className="px-6 py-4 border-b border-sivac-border-card flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sivac-green animate-pulse" />
                <h3 className="text-14 font-bold font-poppins text-sivac-heading uppercase tracking-wide">
                  Visor de PDF - Visita {selectedAudit.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPdfModalOpen(false);
                    setSelectedAudit(null);
                  }}
                  className="p-1.5 hover:bg-sivac-bg-toggle rounded-lg text-sivac-muted hover:text-sivac-heading transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-sivac-bg-primary scrollbar-thin">
              <div id="pdf-modal-content" className="mx-auto max-w-[800px] bg-sivac-bg-primary">
                <FormatoVisitaUTP {...getReportData(selectedAudit)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


const parseAsistenciaObs = (rawObs: string) => {
  if (!rawObs) return { alumnosAmbiente: "" as number | "", alumnosIntranet: "" as number | "", observaciones: "" };
  const match = rawObs.match(/^\[alumnos_ambiente:(\d*),alumnos_intranet:(\d*)\]([\s\S]*)$/);
  if (match) {
    return {
      alumnosAmbiente: match[1] === "" ? "" : parseInt(match[1], 10),
      alumnosIntranet: match[2] === "" ? "" : parseInt(match[2], 10),
      observaciones: match[3].trim()
    };
  }
  return { alumnosAmbiente: "" as number | "", alumnosIntranet: "" as number | "", observaciones: rawObs };
};

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

const formatTimeDisplay = (timeStr: string | null | undefined): string => {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
};

const mapEstado = (estadoId: number | null | undefined): "Cumple" | "Pendiente" | "En progreso" | "Observada" => {
  if (estadoId === 1) return "Pendiente";
  if (estadoId === 2) return "En progreso";
  if (estadoId === 3) return "Cumple";
  return "Observada";
};
