"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Trash2,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

interface SIVACVisit {
  id: number;
  fecha_visita: string;
  aula: string;
  asignatura: string;
  docenteNombre: string;
  sedeNombre: string;
  auditor_id?: number | null;
}

interface EvidenceCard {
  id: number;
  section: string;
  filename: string;
  datetime: string;
  location: string;
  size: string;
  url_foto: string;
}

function EvidenciasContent() {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  
  const [visits, setVisits] = useState<SIVACVisit[]>([]);
  const [selectedVisitId, setSelectedVisitId] = useState<string>("");
  const [evidences, setEvidences] = useState<EvidenceCard[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [loadingEvidences, setLoadingEvidences] = useState(false);
  
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadSection, setUploadSection] = useState<string>("Inicio de Clases");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const ROL_ACTIVO = user?.rol;
  
  const selectedVisitObj = visits.find((v) => v.id.toString() === selectedVisitId);
  const esPropietario = selectedVisitObj && Number(selectedVisitObj.auditor_id) === Number(user?.id);

  
  
  const esSoloConsulta = ROL_ACTIVO === "Docente" || 
    (ROL_ACTIVO === "Admin" && !esPropietario) || 
    (ROL_ACTIVO === "Auditor" && !esPropietario);

  
  const fetchVisits = useCallback(async () => {
    setLoadingVisits(true);
    try {
      let dbQuery = supabase
        .from("visitas")
        .select(`
          id,
          fecha_visita,
          ciclo,
          turno,
          semana_nro,
          auditor_id,
          aulas(nombre),
          asignaturas(nombre),
          docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
          sedes(nombre)
        `)
        .is("deleted_at", null);

      if (ROL_ACTIVO === "Auditor") {
        dbQuery = dbQuery.eq("auditor_id", parseInt(user?.id || "0", 10));
      } else if (ROL_ACTIVO === "Docente") {
        dbQuery = dbQuery.eq("docente_id", parseInt(user?.id || "0", 10));
      }

      const { data, error } = await dbQuery.order("id", { ascending: false });

      if (error) {
        console.error("Error al cargar visitas para evidencias:", error);
        return;
      }

      if (data) {
        const mapped: SIVACVisit[] = data.map((v: any) => {
          const docN = `${v.docente?.nombres || ""} ${v.docente?.apellidos || ""}`.trim() || "Sin asignar";
          return {
            id: v.id,
            fecha_visita: v.fecha_visita,
            aula: v.aulas?.nombre || "Sin aula",
            asignatura: v.asignaturas?.nombre || "Sin curso",
            docenteNombre: docN,
            sedeNombre: v.sedes?.nombre || "Sin sede",
            auditor_id: v.auditor_id,
          };
        });
        setVisits(mapped);

        
        const paramId = searchParams.get("visitaId");
        if (paramId) {
          setSelectedVisitId(paramId);
        } else if (mapped.length > 0) {
          
          setSelectedVisitId(mapped[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVisits(false);
    }
  }, [supabase, searchParams]);

  const visitsRef = React.useRef<SIVACVisit[]>([]);
  useEffect(() => {
    visitsRef.current = visits;
  }, [visits]);

  
  const fetchEvidences = useCallback(async (visitaId: string, showLoader = false) => {
    if (!visitaId) {
      setEvidences([]);
      return;
    }
    if (showLoader) {
      setLoadingEvidences(true);
    }
    try {
      const { data, error } = await supabase
        .from("evidencias_fotos")
        .select("*")
        .eq("visita_id", parseInt(visitaId, 10))
        .order("id", { ascending: false });

      if (error) {
        console.error("Error al cargar evidencias:", error);
        return;
      }

      if (data) {
        const visitDetail = visitsRef.current.find(v => v.id.toString() === visitaId);
        const mapped: EvidenceCard[] = data.map((e: any) => {
          
          let filename = "foto.jpg";
          if (e.url_foto) {
            if (e.url_foto.startsWith("data:")) {
              filename = `Evidencia - ${e.seccion || "General"}`;
            } else {
              filename = e.url_foto.split("/").pop() || "foto.jpg";
              if (filename.startsWith("mock_")) {
                filename = filename.substring(5);
              }
            }
          }
          
          
          let dateText = "Recién subido";
          if (e.fecha_captura) {
            try {
              let isoStr = e.fecha_captura;
              if (!isoStr.endsWith("Z") && !isoStr.includes("+") && !/-\d{2}:\d{2}$/.test(isoStr)) {
                isoStr += "Z";
              }
              const d = new Date(isoStr);
              dateText = d.toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              dateText = "Recién subido";
            }
          } else if (visitDetail) {
            dateText = visitDetail.fecha_visita;
          }

          return {
            id: e.id,
            section: `Sección: ${e.seccion || "General"}`,
            filename,
            datetime: dateText,
            location: visitDetail ? `${visitDetail.sedeNombre} - ${visitDetail.aula}` : "Sede Central",
            size: "1.5 MB", 
            url_foto: e.url_foto,
          };
        });
        setEvidences(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvidences(false);
    }
  }, [supabase]);

  
  useEffect(() => {
    if (user) {
      fetchVisits();
    }
  }, [fetchVisits, user]);

  useEffect(() => {
    if (selectedVisitId) {
      fetchEvidences(selectedVisitId, true);
      
      const params = new URLSearchParams(window.location.search);
      if (params.get("visitaId") !== selectedVisitId) {
        router.replace(`?visitaId=${selectedVisitId}`, { scroll: false });
      }
    }
  }, [selectedVisitId, fetchEvidences, router]);

  
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  
  const handleUploadFiles = async (files: File[]) => {
    if (!selectedVisitId) return;
    try {
      for (const file of files) {
        const base64Data = await fileToBase64(file);
        const { error } = await supabase.from("evidencias_fotos").insert({
          visita_id: parseInt(selectedVisitId, 10),
          seccion: uploadSection,
          url_foto: base64Data,
          fecha_captura: new Date().toISOString(),
        });
        if (error) throw error;
      }
      
      
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      fetchEvidences(selectedVisitId);
      setUploadedFiles([]);
    } catch (err) {
      console.error("Error al subir evidencias:", err);
      alert("Ocurrió un error al guardar la evidencia fotográfica.");
    }
  };

  
  const handleDeleteEvidence = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta evidencia fotográfica?")) return;
    try {
      const { error } = await supabase.from("evidencias_fotos").delete().eq("id", id);
      if (error) {
        alert("No se pudo eliminar la evidencia: " + error.message);
      } else {
        setEvidences(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedVisitDetails = visits.find(v => v.id.toString() === selectedVisitId);

  
  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-40 bg-white/5 rounded-lg w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-sivac-blue bg-sivac-blue/15 px-2 py-0.5 rounded border border-sivac-blue/30 inline-flex items-center gap-1 mb-2">
            <Sparkles size={10} /> Panel de Evidencias
          </span>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Evidencias Digitales
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            Gestión visual y carga de evidencias fotográficas tomadas en las visitas de aula.
          </p>
        </div>
      </div>

      {}
      {esSoloConsulta && (
        <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-center">
          <ShieldAlert size={18} className="text-sivac-blue-light flex-shrink-0" />
          <span className="text-13">
            <strong>Modo de Consulta Activo:</strong> Tu acceso a esta visita es de solo lectura. No está permitido cargar nuevas evidencias ni eliminar archivos ya que no eres el auditor asignado a esta visita.
          </span>
        </div>
      )}

      {}
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-16 font-bold text-sivac-heading">Clase de Auditoría Seleccionada</h3>
            <p className="text-12 text-sivac-muted mt-0.5">Selecciona el aula o visita para gestionar sus fotografías.</p>
          </div>
          
          <div className="relative w-full sm:w-[360px]">
            {loadingVisits ? (
              <div className="h-[40px] w-full bg-sivac-bg-secondary/40 border border-sivac-border-card rounded-lg flex items-center justify-center text-12 text-sivac-muted">
                <Loader2 size={14} className="animate-spin mr-2" /> Cargando visitas...
              </div>
            ) : (
              <select
                value={selectedVisitId}
                onChange={(e) => setSelectedVisitId(e.target.value)}
                className="h-[40px] w-full pl-3.5 pr-10 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-13 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer appearance-none"
              >
                {visits.length === 0 && <option value="">No hay visitas disponibles</option>}
                {visits.map((v) => (
                  <option key={v.id} value={v.id}>
                    [{v.aula}] {v.fecha_visita} - {v.docenteNombre.split(" ")[0]} - {v.asignatura.split(" (")[0]}
                  </option>
                ))}
              </select>
            )}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-sivac-muted">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {}
        {selectedVisitDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-sivac-bg-secondary/20 border border-sivac-border-glass text-12">
            <div>
              <span className="block text-sivac-muted font-semibold uppercase text-[10px]">Docente</span>
              <span className="text-sivac-light font-medium">{selectedVisitDetails.docenteNombre}</span>
            </div>
            <div>
              <span className="block text-sivac-muted font-semibold uppercase text-[10px]">Curso</span>
              <span className="text-sivac-light font-medium truncate block">{selectedVisitDetails.asignatura}</span>
            </div>
            <div>
              <span className="block text-sivac-muted font-semibold uppercase text-[10px]">Ubicación</span>
              <span className="text-sivac-light font-medium">{selectedVisitDetails.sedeNombre} - {selectedVisitDetails.aula}</span>
            </div>
            <div>
              <span className="block text-sivac-muted font-semibold uppercase text-[10px]">Fecha de Visita</span>
              <span className="text-sivac-light font-medium">{selectedVisitDetails.fecha_visita}</span>
            </div>
          </div>
        )}
      </div>

      {}
      {!esSoloConsulta && selectedVisitId && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-16 font-bold text-sivac-heading">Cargar Nueva Fotografía</h3>
              <p className="text-12 text-sivac-muted mt-0.5">Asigna la foto a una sección de evaluación específica.</p>
            </div>
            
            {}
            <div className="flex items-center gap-2">
              <span className="text-12 font-medium text-sivac-muted">Sección:</span>
              <select
                value={uploadSection}
                onChange={(e) => setUploadSection(e.target.value)}
                className="h-[34px] px-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded text-12 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
              >
                <option value="Inicio de Clases">Inicio de Clases</option>
                <option value="Desarrollo Temático">Desarrollo Temático</option>
                <option value="Uso de Laboratorio">Uso de Laboratorio</option>
                <option value="Cierre y Firma">Cierre y Firma</option>
              </select>
            </div>
          </div>

          {}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              if (files.length > 0) handleUploadFiles(files);
            }}
            onClick={() => document.getElementById('evidences-page-file-input')?.click()}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 sm:p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-sivac-blue bg-sivac-blue/10 shadow-inner'
                : 'border-sivac-border-card bg-sivac-bg-input-admin/40 hover:border-sivac-blue/50 hover:bg-sivac-bg-input-admin/75'
            }`}
          >
            <input
              id="evidences-page-file-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) handleUploadFiles(files);
                e.target.value = '';
              }}
            />
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-sivac-blue/20 text-sivac-blue' : 'bg-sivac-bg-surface text-sivac-muted border border-sivac-border-card'
            }`}>
              <Camera size={22} strokeWidth={1.5} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-14 font-semibold text-sivac-light">
                Arrastra tus fotos aquí o haz clic para explorar
              </p>
              <p className="text-12 text-sivac-dim">
                Formatos JPG, PNG o WebP — Hasta 10 MB por archivo
              </p>
            </div>
          </div>
        </div>
      )}

      {}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 p-4 rounded-xl bg-sivac-green/15 border border-sivac-green/30 text-sivac-green-light flex items-center gap-2.5 shadow-xl animate-fadeIn z-50">
          <CheckCircle2 size={18} />
          <span className="text-13 font-bold">¡Evidencia fotográfica subida con éxito!</span>
        </div>
      )}

      {}
      <div className="space-y-4">
        <h2 className="text-18 font-bold text-sivac-light">
          Evidencias Registradas en esta Visita
        </h2>

        {loadingEvidences ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <Loader2 size={24} className="text-sivac-blue animate-spin" />
            <p className="text-12 text-sivac-muted">Cargando fotografías desde la base de datos...</p>
          </div>
        ) : evidences.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-sivac-border-card rounded-xl bg-sivac-bg-secondary/15 space-y-3">
            <ImageIcon size={32} className="mx-auto text-sivac-dim" />
            <h3 className="text-14 font-semibold text-sivac-heading">No hay evidencias registradas</h3>
            <p className="text-12 text-sivac-muted max-w-xs mx-auto">
              Esta visita de aula aún no tiene fotografías de respaldo adjuntas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evidences.map((card) => (
              <div
                key={card.id}
                className="admin-card overflow-hidden flex flex-col sm:flex-row group hover:border-sivac-blue/30 transition-all"
              >
                {}
                <div className="w-full sm:w-[180px] h-[160px] sm:h-auto bg-sivac-bg-input-admin border-b sm:border-b-0 sm:border-r border-sivac-border-card relative overflow-hidden flex items-center justify-center group-hover:bg-sivac-bg-secondary/10 transition-colors">
                  {card.url_foto ? (
                    <img 
                      src={card.url_foto} 
                      alt={card.filename} 
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon size={36} strokeWidth={1.5} className="mb-2 text-sivac-blue-light/70" />
                      <span className="text-11 font-medium tracking-wide uppercase">{card.size}</span>
                    </div>
                  )}
                  {}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sivac-blue" />
                </div>

                {}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-11 font-bold text-sivac-indigo bg-sivac-blue/10 px-2 py-0.5 rounded border border-sivac-blue/20">
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

                  {}
                  <div className="flex gap-2 pt-2 border-t border-sivac-border/25">
                    <a
                      href={card.url_foto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-[32px] rounded border border-sivac-border-card text-12 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-secondary transition-colors flex items-center justify-center cursor-pointer"
                    >
                      Ver Evidencia
                    </a>

                    {}
                    {!esSoloConsulta && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(card.id)}
                        className="h-[32px] px-3 rounded border border-sivac-red/30 hover:border-sivac-red hover:bg-sivac-red/10 text-sivac-red-light transition-colors cursor-pointer"
                        title="Eliminar evidencia"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvidenciasPage() {
  return (
    <Suspense fallback={null}>
      <EvidenciasContent />
    </Suspense>
  );
}
