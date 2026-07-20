"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, ArrowLeft, ArrowRight, Save, CheckCircle2, ImagePlus, Upload, X, AlertTriangle } from "lucide-react";
import { Paso2ControlDocente } from "@/components/inspecciones/Paso2ControlDocente";
import { Paso3MaterialVirtual } from "@/components/inspecciones/Paso3MaterialVirtual";
import { Paso4Asistencia } from "@/components/inspecciones/Paso4Asistencia";
import { Paso5AvanceSilabico } from "@/components/inspecciones/Paso5AvanceSilabico";
import { Paso6GuiaPractica } from "@/components/inspecciones/Paso6GuiaPractica";
import { Paso7Firmas } from "@/components/inspecciones/Paso7Firmas";
import { AccessGuard } from "@/components/layout/AccessGuard";
import { useAuth } from "@/lib/AuthContext";

const getLocalTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

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

export default function InspeccionesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasEvidences, setHasEvidences] = useState(false);
  const [finishedWithoutEvidence, setFinishedWithoutEvidence] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showEvidenceSuccessModal, setShowEvidenceSuccessModal] = useState(false);
  const [uploadSection, setUploadSection] = useState<string>("Inicio de Clases");

  
  const [formData, setFormData] = useState({
    
    sedeFilial: "",
    ciclo: "",
    turno: "",
    aula: "",
    asignatura: "",
    semanaNo: "",
    modalidad: "",
    docenteNombre: "",

    
    docentePresente: "" as "Presente" | "Ausente" | "",
    horarioProgramado: "" as "Puntual" | "Impuntual" | "",
    interaccion: "" as "Interactúa" | "No Interactúa" | "",
    observacionesAusencia: "",
    actividadDocente: "",

    
    materialCargado: "" as "CUMPLE" | "NO CUMPLE" | "",
    observacionesMaterial: "",

    
    alumnosAmbiente: "" as number | "",
    alumnosIntranet: "" as number | "",
    observacionesAsistencia: "",

    
    silaboCoincide: "" as "CUMPLE" | "NO CUMPLE" | "",
    temaAnteriorCoincide: "" as "CUMPLE" | "NO CUMPLE" | "",
    ingresoSilaboVirtual: "" as "CUMPLE" | "NO CUMPLE" | "",
    observacionesSilabo: "",

    
    guiaPractica: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    logroMedir: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    rubricaEvaluacion: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    observacionesGuia: "",

    
    firmaDocenteUrl: ""
  });

  const [validationError, setValidationError] = useState("");

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setValidationError("");
  };

  const [visitaId, setVisitaId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<{ id: number; nombres: string; apellidos: string }[]>([]);
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
  const [ciclos, setCiclos] = useState<{ id: number; nombre: string }[]>([]);
  const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([]);
  const [aulas, setAulas] = useState<{ id: number; nombre: string; sede_id: number }[]>([]);
  const [asignaturas, setAsignaturas] = useState<{ id: number; nombre: string }[]>([]);
  const { user } = useAuth();

  
  const getFilteredSedes = () => {
    return sedes.filter(s => !s.nombre.endsWith(" (Inactivo)") || s.nombre === formData.sedeFilial);
  };

  const getFilteredCiclos = () => {
    return ciclos.filter(c => !c.nombre.endsWith(" (Inactivo)") || c.nombre === formData.ciclo);
  };

  const getFilteredTurnos = () => {
    return turnos.filter(t => !t.nombre.endsWith(" (Inactivo)") || t.nombre === formData.turno);
  };

  const getFilteredAsignaturas = () => {
    return asignaturas.filter(a => !a.nombre.endsWith(" (Inactivo)") || a.nombre === formData.asignatura);
  };

  const getFilteredAulas = () => {
    const selectedSedeObj = sedes.find(s => s.nombre === formData.sedeFilial);
    const unfiltered = selectedSedeObj 
      ? aulas.filter(a => a.sede_id === selectedSedeObj.id)
      : [];
    return unfiltered.filter(a => !a.nombre.endsWith(" (Inactivo)") || a.nombre === formData.aula);
  };

  const getFilteredTeachers = () => {
    return teachers.filter(t => {
      const fullName = `${t.nombres} ${t.apellidos}`.trim();
      return !t.apellidos.endsWith(" (Inactivo)") || fullName === formData.docenteNombre;
    });
  };

  
  React.useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        
        const [resTeachers, resSedes, resCiclos, resTurnos, resAulas, resAsignaturas] = await Promise.all([
          supabase.from("usuarios").select("id, nombres, apellidos").eq("rol_id", 3).order("nombres"),
          supabase.from("sedes").select("id, nombre").order("nombre"),
          supabase.from("ciclos").select("id, nombre").order("nombre"),
          supabase.from("turnos").select("id, nombre").order("nombre"),
          supabase.from("aulas").select("id, nombre, sede_id").order("nombre"),
          supabase.from("asignaturas").select("id, nombre").order("nombre"),
        ]);

        if (resTeachers.data) setTeachers(resTeachers.data);
        if (resSedes.data) setSedes(resSedes.data);
        if (resCiclos.data) setCiclos(resCiclos.data);
        if (resTurnos.data) setTurnos(resTurnos.data);
        if (resAulas.data) setAulas(resAulas.data);
        if (resAsignaturas.data) setAsignaturas(resAsignaturas.data);

        
        const params = new URLSearchParams(window.location.search);
        const idParam = params.get("visitaId");
        if (!idParam) {
          let auditorId = 2;
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email) {
            const { data: dbUser } = await supabase
              .from("usuarios")
              .select("id")
              .eq("username", session.user.email)
              .maybeSingle();
            if (dbUser) {
              auditorId = dbUser.id;
            }
          }

          const { data: newVisita, error } = await supabase
            .from("visitas")
            .insert({
              auditor_id: auditorId,
              fecha_visita: new Date().toISOString().split("T")[0],
              hora_inicio_real: getLocalTimeString(),
              estado_id: 2, 
              ultimo_paso_completado: 1,
              ciclo: params.get("ciclo") || "2026-I",
              turno: params.get("turno") || "Noche",
              semana_nro: parseInt(params.get("semanaNo") || "12", 10),
            })
            .select("id")
            .single();

          if (!error && newVisita) {
            setVisitaId(newVisita.id);
            window.history.replaceState(null, "", `?visitaId=${newVisita.id}`);
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogos e inicializar visita:", err);
      }
    }
    loadData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("visitaId");
      
      if (idParam) {
        const vid = parseInt(idParam, 10);
        setVisitaId(vid);
        fetchVisitaData(vid);
      } else {
        const sede = params.get("sedeFilial");
        const ciclo = params.get("ciclo");
        const turno = params.get("turno");
        const aula = params.get("aula");
        const asignatura = params.get("asignatura");
        const docente = params.get("docenteNombre");

        if (sede || ciclo || turno || aula || asignatura || docente) {
          setFormData((prev) => ({
            ...prev,
            sedeFilial: sede || prev.sedeFilial,
            ciclo: ciclo || prev.ciclo,
            turno: turno || prev.turno,
            aula: aula || prev.aula,
            asignatura: asignatura || prev.asignatura,
            docenteNombre: docente || prev.docenteNombre,
          }));
        }
      }
    }
  }, []);

  const fetchVisitaData = async (vid: number) => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { data: visita } = await supabase
        .from("visitas")
        .select(`
          *,
          sedes(nombre),
          aulas(nombre),
          asignaturas(nombre),
          docente:usuarios!visitas_docente_id_fkey(nombres, apellidos)
        `)
        .eq("id", vid)
        .maybeSingle();

      if (!visita) return;

      const { data: evalControl } = await supabase
        .from("eval_control_docente")
        .select("*")
        .eq("visita_id", vid)
        .maybeSingle();

      const { data: evalAcad } = await supabase
        .from("eval_academica_detalle")
        .select("*")
        .eq("visita_id", vid)
        .maybeSingle();

      const { data: evalAsistencia } = await supabase
        .from("eval_asistencia")
        .select("*")
        .eq("visita_id", vid)
        .maybeSingle();

      const { data: evalGuia } = await supabase
        .from("eval_guia_practica")
        .select("*")
        .eq("visita_id", vid)
        .maybeSingle();

      const { data: fotos } = await supabase
        .from("evidencias_fotos")
        .select("*")
        .eq("visita_id", vid);

      if (fotos && fotos.length > 0) {
        setHasEvidences(true);
      }

      const parsedAsistencia = parseAsistenciaObs(evalAsistencia?.observaciones || "");
      const isEncodedAsistencia = evalAsistencia?.observaciones?.startsWith("[alumnos_ambiente:") ?? false;
      const finalAlumnosAmbiente = (evalAsistencia
        ? (parsedAsistencia.alumnosAmbiente !== "" ? parsedAsistencia.alumnosAmbiente : (isEncodedAsistencia ? "" : 25))
        : "") as number | "";
      const finalAlumnosIntranet = (evalAsistencia
        ? (parsedAsistencia.alumnosIntranet !== "" ? parsedAsistencia.alumnosIntranet : (isEncodedAsistencia ? "" : 25))
        : "") as number | "";

      setFormData({
        sedeFilial: (visita.sedes as any)?.nombre || "Sede Central - Lima",
        ciclo: visita.ciclo || "2026-I",
        turno: visita.turno || "Noche",
        aula: (visita.aulas as any)?.nombre || "",
        asignatura: (visita.asignaturas as any)?.nombre || "",
        semanaNo: (visita.semana_nro || 12).toString(),
        modalidad: "Presencial",
        docenteNombre: `${(visita.docente as any)?.nombres || ""} ${(visita.docente as any)?.apellidos || ""}`.trim() || "Docente",
        docentePresente: evalControl ? (evalControl.presente_id === 4 ? "Presente" : evalControl.presente_id === 5 ? "Ausente" : "") : "",
        horarioProgramado: evalControl ? (evalControl.horario_id === 6 ? "Puntual" : evalControl.horario_id === 7 ? "Impuntual" : "") : "",
        interaccion: evalControl ? (evalControl.interaccion_id === 1 ? "Interactúa" : evalControl.interaccion_id === 2 ? "No Interactúa" : "") : "",
        observacionesAusencia: evalControl?.observaciones || "",
        actividadDocente: evalControl?.actividad_detalle || "",
        materialCargado: evalAcad ? (evalAcad.material_cumple_id === 1 ? "CUMPLE" : evalAcad.material_cumple_id === 2 ? "NO CUMPLE" : "") : "",
        observacionesMaterial: evalAcad?.obs_material || "",
        alumnosAmbiente: finalAlumnosAmbiente,
        alumnosIntranet: finalAlumnosIntranet,
        observacionesAsistencia: parsedAsistencia.observaciones,
        silaboCoincide: evalAcad ? (evalAcad.silabo_coincide_actual_id === 1 ? "CUMPLE" : evalAcad.silabo_coincide_actual_id === 2 ? "NO CUMPLE" : "") : "",
        temaAnteriorCoincide: evalAcad ? (evalAcad.silabo_coincide_anterior_id === 1 ? "CUMPLE" : evalAcad.silabo_coincide_anterior_id === 2 ? "NO CUMPLE" : "") : "",
        ingresoSilaboVirtual: evalAcad ? (evalAcad.silabo_virtual_id === 1 ? "CUMPLE" : evalAcad.silabo_virtual_id === 2 ? "NO CUMPLE" : "") : "",
        observacionesSilabo: evalAcad?.obs_avance_silabico || "",
        guiaPractica: evalGuia ? (evalGuia.cumple_tema_id === 1 ? "CUMPLE" : evalGuia.cumple_tema_id === 2 ? "NO CUMPLE" : evalGuia.cumple_tema_id === 3 ? "NO APLICA" : "") : "",
        logroMedir: evalGuia ? (evalGuia.evidencia_logro_id === 1 ? "CUMPLE" : evalGuia.evidencia_logro_id === 2 ? "NO CUMPLE" : evalGuia.evidencia_logro_id === 3 ? "NO APLICA" : "") : "",
        rubricaEvaluacion: evalGuia ? (evalGuia.cuenta_rubrica_id === 1 ? "CUMPLE" : evalGuia.cuenta_rubrica_id === 2 ? "NO CUMPLE" : evalGuia.cuenta_rubrica_id === 3 ? "NO APLICA" : "") : "",
        observacionesGuia: evalGuia?.observaciones || "",
        firmaDocenteUrl: visita.firma_docente_b64 || "",
      });

      if (visita.ultimo_paso_completado) {
        setCurrentStep(Math.min(visita.ultimo_paso_completado, 7));
      }
    } catch (err) {
      console.error("Error al recuperar datos de la visita:", err);
    }
  };

  const cumpleIdMap = (val: string) => {
    if (val === "CUMPLE") return 1;
    if (val === "NO CUMPLE") return 2;
    return 3;
  };

  const saveStepProgress = async (step: number) => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      let currentVisitaId = visitaId;

      if (step === 1) {
        const { data: Sede } = await supabase
          .from("sedes")
          .select("id")
          .eq("nombre", formData.sedeFilial)
          .maybeSingle();
        let sId = Sede?.id;
        if (!sId) {
          const { data: newSede } = await supabase
            .from("sedes")
            .insert({ nombre: formData.sedeFilial })
            .select("id")
            .single();
          sId = newSede?.id;
        }

        let aId = null;
        if (sId) {
          const { data: Aula } = await supabase
            .from("aulas")
            .select("id")
            .eq("nombre", formData.aula)
            .eq("sede_id", sId)
            .maybeSingle();
          aId = Aula?.id;
        }
        if (!aId && sId) {
          const { data: newAula } = await supabase
            .from("aulas")
            .insert({ nombre: formData.aula, sede_id: sId })
            .select("id")
            .single();
          aId = newAula?.id;
        }

        const { data: Asig } = await supabase
          .from("asignaturas")
          .select("id")
          .eq("nombre", formData.asignatura)
          .maybeSingle();
        let asigId = Asig?.id;
        if (!asigId) {
          const { data: newAsig } = await supabase
            .from("asignaturas")
            .insert({ nombre: formData.asignatura })
            .select("id")
            .single();
          asigId = newAsig?.id;
        }

        const selectedTeacher = teachers.find(
          (t) => `${t.nombres} ${t.apellidos}`.trim() === formData.docenteNombre
        );
        const docId = selectedTeacher?.id || 3;

        const payload = {
          auditor_id: user ? parseInt(user.id, 10) : 2,
          docente_id: docId,
          sede_id: sId,
          aula_id: aId,
          asignatura_id: asigId,
          fecha_visita: new Date().toISOString().split("T")[0],
          ciclo: formData.ciclo,
          turno: formData.turno,
          semana_nro: parseInt(formData.semanaNo, 10) || 12,
          ultimo_paso_completado: 2,
          estado_id: 2, 
        };

        if (currentVisitaId) {
          await supabase
            .from("visitas")
            .update(payload)
            .eq("id", currentVisitaId);
        } else {
          const { data: newVisita } = await supabase
            .from("visitas")
            .insert({
              ...payload,
              hora_inicio_real: getLocalTimeString(),
            })
            .select("id")
            .single();
          if (newVisita) {
            currentVisitaId = newVisita.id;
            setVisitaId(newVisita.id);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `?visitaId=${newVisita.id}`);
            }
          }
        }
      } else {
        if (currentVisitaId) {
          await supabase
            .from("visitas")
            .update({ ultimo_paso_completado: Math.max(step + 1, 2) })
            .eq("id", currentVisitaId);
        }
      }

      if (!currentVisitaId) return;

      if (step === 2) {
        const presenteId = formData.docentePresente === "Presente" ? 4 : 5;
        const horarioId = formData.horarioProgramado === "Puntual" ? 6 : 7;
        const interaccionId = formData.interaccion === "Interactúa" ? 1 : 2;

        await supabase.from("eval_control_docente").upsert({
          visita_id: currentVisitaId,
          presente_id: presenteId,
          horario_id: horarioId,
          interaccion_id: interaccionId,
          actividad_detalle: formData.actividadDocente,
          observaciones: formData.observacionesAusencia,
        });
      }

      if (step === 3) {
        const cumpleId = formData.materialCargado === "CUMPLE" ? 1 : 2;
        const { data: existing } = await supabase
          .from("eval_academica_detalle")
          .select("*")
          .eq("visita_id", currentVisitaId)
          .maybeSingle();

        await supabase.from("eval_academica_detalle").upsert({
          visita_id: currentVisitaId,
          material_cumple_id: cumpleId,
          obs_material: formData.observacionesMaterial,
          silabo_coincide_actual_id: existing?.silabo_coincide_actual_id || null,
          silabo_coincide_anterior_id: existing?.silabo_coincide_anterior_id || null,
          silabo_virtual_id: existing?.silabo_virtual_id || null,
          obs_avance_silabico: existing?.obs_avance_silabico || null,
        });
      }

      if (step === 4) {
        const ambienteId = formData.alumnosAmbiente !== "" ? 1 : null;
        const intranetId = formData.alumnosIntranet !== "" ? 1 : null;
        const encodedObs = `[alumnos_ambiente:${formData.alumnosAmbiente},alumnos_intranet:${formData.alumnosIntranet}]${formData.observacionesAsistencia}`.trim();
        await supabase.from("eval_asistencia").upsert({
          visita_id: currentVisitaId,
          ambiente_cumple_id: ambienteId,
          intranet_cumple_id: intranetId,
          observaciones: encodedObs,
        });
      }

      if (step === 5) {
        const silaboId = formData.silaboCoincide === "CUMPLE" ? 1 : 2;
        const anteriorId = formData.temaAnteriorCoincide === "CUMPLE" ? 1 : 2;
        const virtualId = formData.ingresoSilaboVirtual === "CUMPLE" ? 1 : 2;

        const { data: existing } = await supabase
          .from("eval_academica_detalle")
          .select("*")
          .eq("visita_id", currentVisitaId)
          .maybeSingle();

        await supabase.from("eval_academica_detalle").upsert({
          visita_id: currentVisitaId,
          material_cumple_id: existing?.material_cumple_id || 1,
          obs_material: existing?.obs_material || "",
          silabo_coincide_actual_id: silaboId,
          silabo_coincide_anterior_id: anteriorId,
          silabo_virtual_id: virtualId,
          obs_avance_silabico: formData.observacionesSilabo,
        });
      }

      if (step === 6) {
        await supabase.from("eval_guia_practica").upsert({
          visita_id: currentVisitaId,
          cumple_tema_id: cumpleIdMap(formData.guiaPractica),
          evidencia_logro_id: cumpleIdMap(formData.logroMedir),
          cuenta_rubrica_id: cumpleIdMap(formData.rubricaEvaluacion),
          observaciones: formData.observacionesGuia,
        });
      }
    } catch (err) {
      console.error("Error al guardar progreso del paso:", err);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const finalizeInspection = async (completed: boolean, overrideHasEvidences?: boolean) => {
    if (!visitaId) return;
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      
      let auditorFirma = "";
      if (typeof window !== "undefined" && user?.id) {
        auditorFirma = localStorage.getItem(`sivac_signature_user_${user.id}`) || "";
      }

      const hasTeacherSignature = formData.firmaDocenteUrl && formData.firmaDocenteUrl.trim() !== "";
      const actualHasEvidences = overrideHasEvidences !== undefined ? overrideHasEvidences : hasEvidences;

      let finalEstadoId = 2; 
      if (completed) {
        finalEstadoId = hasTeacherSignature ? (actualHasEvidences ? 3 : 4) : 1;
      }

      await supabase
        .from("visitas")
        .update({
          estado_id: finalEstadoId,
          ultimo_paso_completado: 7,
          firma_docente_b64: formData.firmaDocenteUrl || null,
          firma_auditor_b64: auditorFirma || null,
          hora_termino_real: getLocalTimeString(),
        })
        .eq("id", visitaId);
    } catch (err) {
      console.error("Error al finalizar la inspección:", err);
    }
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        if (
          !formData.sedeFilial ||
          !formData.ciclo ||
          !formData.turno ||
          !formData.aula.trim() ||
          !formData.asignatura.trim() ||
          !formData.semanaNo ||
          !formData.modalidad ||
          !formData.docenteNombre
        ) {
          setValidationError("Por favor, complete todos los campos");
          return false;
        }
        break;
      case 2:
        if (!formData.docentePresente) {
          setValidationError("Por favor, complete todos los campos");
          return false;
        }
        if (formData.docentePresente === "Presente") {
          if (!formData.horarioProgramado || !formData.interaccion) {
            setValidationError("Por favor, complete todos los campos");
            return false;
          }
        }
        break;
      case 3:
        if (!formData.materialCargado) {
          setValidationError("Por favor, complete todos los campos");
          return false;
        }
        break;
      case 4:
        if (formData.modalidad === "Virtual") {
          if (formData.alumnosIntranet === "") {
            setValidationError("Por favor, complete todos los campos");
            return false;
          }
        } else if (formData.modalidad === "Presencial") {
          if (formData.alumnosAmbiente === "") {
            setValidationError("Por favor, complete todos los campos");
            return false;
          }
        } else {
          if (formData.alumnosAmbiente === "" || formData.alumnosIntranet === "") {
            setValidationError("Por favor, complete todos los campos");
            return false;
          }
        }
        break;
      case 5:
        if (!formData.silaboCoincide || !formData.temaAnteriorCoincide || !formData.ingresoSilaboVirtual) {
          setValidationError("Por favor, complete todos los campos");
          return false;
        }
        break;
      case 6:
        if (!formData.guiaPractica || !formData.logroMedir || !formData.rubricaEvaluacion) {
          setValidationError("Por favor, complete todos los campos");
          return false;
        }
        break;
      case 7:
        
        break;
    }
    setValidationError("");
    return true;
  };

  const handleNext = async () => {
    if (!isStepValid()) return;
    await saveStepProgress(currentStep);
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      
      const missingEvidence = !hasEvidences;
      const missingSignature = !formData.firmaDocenteUrl;

      if (missingEvidence || missingSignature) {
        setShowConfirmModal(true);
      } else {
        await finalizeInspection(true);
        setShowSuccessModal(true);
      }
    }
  };

  const handlePrev = () => {
    setValidationError("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Paso 1: Datos Generales";
      case 2:
        return "Paso 2: Control Docente";
      case 3:
        return "Paso 3: Material Utilizado (Aula Virtual)";
      case 4:
        return "Paso 4: Control de Asistencia";
      case 5:
        return "Paso 5: Avance Silábico";
      case 6:
        return "Paso 6: Guía de Práctica";
      case 7:
        return "Paso 7: Conformidad y Firmas";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Verifica e ingresa los datos correspondientes a la clase y ubicación de la visita.";
      case 2:
        return "Valida la asistencia, puntualidad y el nivel de interacción académica durante la sesión.";
      case 3:
        return "Revisa la carga oportuna de recursos y guías en la plataforma Canvas antes de clases.";
      case 4:
        return "Registra y contrasta los alumnos presentes contra el sistema de asistencia en intranet.";
      case 5:
        return "Verifica la consistencia del tema impartido con el cronograma y avance semanal.";
      case 6:
        return "Evalúa la concordancia y efectividad de las actividades de laboratorio o de prácticas.";
      case 7:
        return "Estampa la firma del docente para finalizar oficialmente el proceso de auditoría.";
      default:
        return "";
    }
  };

  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-sivac-blue/10 border border-sivac-blue/30 text-sivac-indigo-light flex gap-3 items-start">
              <Info size={18} strokeWidth={2.5} className="flex-shrink-0 mt-0.5 text-sivac-blue-light" />
              <div className="text-13 leading-relaxed">
                <span className="font-bold">Datos de Planificación:</span> Ingresa los datos iniciales de la clase observada. Puedes tomarlos del horario programado de supervisión semanal.
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-xl bg-white/5 border border-white/10">
              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Sede Académica</label>
                <select
                  value={formData.sedeFilial}
                  onChange={(e) => updateFormData({ sedeFilial: e.target.value, aula: "" })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione una sede...</option>
                  {getFilteredSedes().map((s) => (
                    <option key={s.id} value={s.nombre}>
                      {s.nombre.replace(" (Inactivo)", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Ciclo Académico</label>
                <select
                  value={formData.ciclo}
                  onChange={(e) => updateFormData({ ciclo: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione un ciclo...</option>
                  {getFilteredCiclos().map((c) => (
                    <option key={c.id} value={c.nombre}>
                      {c.nombre.replace(" (Inactivo)", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Turno</label>
                <select
                  value={formData.turno}
                  onChange={(e) => updateFormData({ turno: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione un turno...</option>
                  {getFilteredTurnos().map((t) => (
                    <option key={t.id} value={t.nombre}>
                      {t.nombre.replace(" (Inactivo)", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Aula / Laboratorio</label>
                <select
                  value={formData.aula}
                  onChange={(e) => updateFormData({ aula: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">
                    {formData.sedeFilial ? "Seleccione un aula..." : "Seleccione una sede primero..."}
                  </option>
                  {getFilteredAulas().map((a) => (
                    <option key={a.id} value={a.nombre}>
                      {a.nombre.replace(" (Inactivo)", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Asignatura del Curso</label>
                <select
                  value={formData.asignatura}
                  onChange={(e) => updateFormData({ asignatura: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione una asignatura...</option>
                  {getFilteredAsignaturas().map((asig) => (
                    <option key={asig.id} value={asig.nombre}>
                      {asig.nombre.replace(" (Inactivo)", "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Semana Lectiva</label>
                <select
                  value={formData.semanaNo}
                  onChange={(e) => updateFormData({ semanaNo: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
                  <option value="">Seleccione una semana...</option>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>{`Semana ${s}`}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Modalidad</label>
                <select
                  value={formData.modalidad}
                  onChange={(e) => updateFormData({ modalidad: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
                  <option value="">Seleccione una modalidad...</option>
                  <option value="Presencial">Presencial (Laboratorio / Aula)</option>
                  <option value="Virtual">Virtual (Zoom / Teams)</option>
                  <option value="Híbrido">Híbrido (Dual)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Nombre del Docente</label>
                <select
                  value={formData.docenteNombre}
                  onChange={(e) => updateFormData({ docenteNombre: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione un docente...</option>
                  {getFilteredTeachers().map((t) => {
                    const fullName = `${t.nombres} ${t.apellidos}`.trim();
                    const cleanFullName = fullName.replace(" (Inactivo)", "");
                    return (
                      <option key={t.id} value={fullName}>
                        {cleanFullName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return <Paso2ControlDocente formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Paso3MaterialVirtual formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Paso4Asistencia formData={formData} updateFormData={updateFormData} modalidad={formData.modalidad} />;
      case 5:
        return <Paso5AvanceSilabico formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <Paso6GuiaPractica formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <Paso7Firmas formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <AccessGuard allowedRoles={["Admin", "Auditor"]}>
      <div className="max-w-4xl mx-auto space-y-8 font-inter relative pb-16">
      {}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-sivac-border-card pb-6">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Inspección Académica Guiada
          </h1>
          <p className="text-14 font-normal text-sivac-muted mt-1.5">
            Evaluación inopinada a docentes en aula virtual y laboratorios.
          </p>
        </div>

        {}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e3a8a33] border border-[#1e3a8a80] text-[#93c5fd] self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-[#60a5fa] animate-pulse" />
          <span className="text-12 font-medium">Autoguardado activado</span>
        </div>
      </div>

      {}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-12 font-semibold text-sivac-muted">
          <span>Progreso de Auditoría</span>
          <span>Paso {currentStep} de 7 ({Math.round((currentStep / 7) * 100)}%)</span>
        </div>
        {}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <div
                key={step}
                className={`h-2.5 rounded transition-all duration-300 ${
                  isCompleted
                    ? "bg-sivac-green"
                    : isCurrent
                      ? "bg-sivac-blue shadow-lg shadow-sivac-blue/20"
                      : "bg-sivac-border-card"
                }`}
                title={`Paso ${step}`}
              />
            );
          })}
        </div>
      </div>

      {}
      <div className="space-y-1">
        <h2 className="text-20 font-bold text-sivac-light font-poppins">
          {getStepTitle()}
        </h2>
        <p className="text-13 font-normal text-sivac-muted">
          {getStepDescription()}
        </p>
      </div>

      {}
      <div className="space-y-6">
        {renderStepContent()}
      </div>

      {}
      {validationError && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative backdrop-blur-xl">
            <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center border border-red-500/30 shrink-0 animate-pulse">
              <AlertTriangle size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="text-18 font-bold font-poppins text-sivac-heading leading-tight">
                Campos Incompletos
              </h3>
              <p className="text-13 leading-relaxed text-sivac-body">
                {validationError}
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setValidationError("")}
                className="w-full h-[40px] bg-sivac-blue hover:bg-blue-700 text-sivac-surface rounded-lg text-13 font-bold transition-all cursor-pointer uppercase tracking-wider shadow-lg shadow-sivac-blue/15"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="flex items-center justify-between border-t border-sivac-border-card pt-6 mt-8">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`h-[44px] px-6 bg-sivac-bg-secondary border border-sivac-border rounded-lg text-14 text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors flex items-center gap-2 font-medium ${
            currentStep === 1 ? "opacity-30 cursor-not-allowed" : ""
          }`}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          <span>Anterior</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="h-[44px] px-6 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold shadow-lg shadow-sivac-blue/10 uppercase tracking-wide-06"
        >
          {currentStep === 7 ? (
            <>
              <Save size={16} strokeWidth={2.5} />
              <span>Finalizar Auditoría</span>
            </>
          ) : (
            <>
              <span>Siguiente</span>
              <ArrowRight size={16} strokeWidth={2} />
            </>
          )}
        </button>
      </div>

      {}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-sivac-bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-sivac-green/15 text-sivac-green mx-auto flex items-center justify-center border border-sivac-green/30">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-20 font-bold font-poppins text-sivac-light">Auditoría Guardada</h3>
              <p className="text-13 text-sivac-muted">
                La supervisión académica inopinada de la clase de <span className="font-semibold text-sivac-light">{formData.docenteNombre}</span> en la asignatura de <span className="font-semibold text-sivac-light">{formData.asignatura}</span> ha sido guardada en la base de datos de manera conforme.
              </p>
            </div>

            {}
            {finishedWithoutEvidence && (() => {
              const missingEvidence = !hasEvidences;
              const missingSignature = !formData.firmaDocenteUrl;

              let bannerText = "";
              if (missingEvidence && missingSignature) {
                bannerText = "Falta registrar la firma de conformidad del docente y subir la evidencia fotográfica de esta inspección. No olvides completarla más tarde.";
              } else if (missingSignature) {
                bannerText = "Falta registrar la firma de conformidad del docente de esta inspección. No olvides completarla más tarde.";
              } else if (missingEvidence) {
                bannerText = "Falta subir la evidencia fotográfica de esta inspección. No olvides completarla más tarde.";
              } else {
                return null;
              }

              return (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left animate-fadeIn">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-12 leading-relaxed text-amber-400/90">
                    <span className="font-bold">Recuerda:</span> {bannerText}
                  </p>
                </div>
              );
            })()}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setFinishedWithoutEvidence(false);
                  setCurrentStep(1);
                  router.push('/admin/visitas');
                }}
                className="w-full h-[44px] bg-sivac-blue hover:bg-blue-700 text-sivac-surface rounded-lg text-13 font-bold transition-colors uppercase tracking-wider"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showConfirmModal && (() => {
        const missingEvidence = !hasEvidences;
        const missingSignature = !formData.firmaDocenteUrl;

        let modalTitle = "Confirmar Finalización";
        let modalText = "Estás a punto de finalizar la inspección.";
        let secondaryButtonText = "Finalizar y completar después";

        if (missingEvidence && missingSignature) {
          modalTitle = "Firma y Evidencias Faltantes";
          modalText = "⚠️ Estás a punto de finalizar la inspección sin la firma de conformidad del docente y sin evidencias fotográficas adjuntas.";
          secondaryButtonText = "Finalizar y registrar después";
        } else if (missingSignature) {
          modalTitle = "Firma del Docente Faltante";
          modalText = "⚠️ Estás a punto de finalizar la inspección sin la firma de conformidad del docente.";
          secondaryButtonText = "Finalizar y firmar después";
        } else if (missingEvidence) {
          modalTitle = "Inspección sin Evidencias";
          modalText = "⚠️ Estás a punto de finalizar la inspección sin evidencias fotográficas adjuntas.";
          secondaryButtonText = "Finalizar y subir más tarde";
        }

        return (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
            <div className="bg-sivac-bg-surface/80 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative backdrop-blur-xl">
              
              {}
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-sivac-yellow/15 text-sivac-yellow mx-auto flex items-center justify-center border border-sivac-yellow/30 shrink-0">
                  <Info size={28} className="text-sivac-yellow" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-18 font-bold font-poppins text-sivac-heading leading-tight">
                    {modalTitle}
                  </h3>
                  <p className="text-14 leading-relaxed text-sivac-body">
                    {modalText}
                  </p>
                </div>
              </div>

              {}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowUploadModal(true);
                  }}
                  className="w-full sm:w-auto h-[44px] px-6 rounded-lg text-13 font-bold bg-sivac-blue hover:bg-blue-700 text-sivac-surface transition-all shadow-lg shadow-sivac-blue/15 cursor-pointer uppercase tracking-wider text-center flex items-center justify-center"
                >
                  Subir evidencias
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowConfirmModal(false);
                    setFinishedWithoutEvidence(true);
                    await finalizeInspection(true);
                    setShowSuccessModal(true);
                  }}
                  className="w-full sm:w-auto h-[40px] px-5 rounded-lg text-13 font-medium text-sivac-muted hover:text-sivac-heading transition-colors cursor-pointer underline underline-offset-2 decoration-sivac-muted/40 hover:decoration-sivac-heading/60 text-center flex items-center justify-center"
                >
                  {secondaryButtonText}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface/80 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative backdrop-blur-xl">

            {}
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-sivac-muted hover:text-sivac-heading cursor-pointer"
            >
              <X size={16} />
            </button>

            {}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-sivac-blue/15 text-sivac-blue mx-auto flex items-center justify-center border border-sivac-blue/30 shrink-0">
                <ImagePlus size={28} />
              </div>
              <h3 className="text-18 font-bold font-poppins text-sivac-heading leading-tight">
                Subir Evidencias Fotográficas
              </h3>
              <p className="text-13 text-sivac-muted">
                Adjunta las fotos tomadas durante la inspección académica.
              </p>
            </div>

            {}
            <div className="space-y-2">
              <label htmlFor="modal-evidence-section" className="text-12 font-bold text-sivac-muted uppercase tracking-wide-06">
                Tipo / Sección de Evidencia
              </label>
              <select
                id="modal-evidence-section"
                value={uploadSection}
                onChange={(e) => setUploadSection(e.target.value)}
                className="w-full h-[40px] px-3 bg-white/[0.05] border border-white/10 rounded-lg text-13 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
              >
                <option value="Inicio de Clases" className="bg-sivac-bg-surface text-sivac-light">Inicio de Clases</option>
                <option value="Desarrollo Temático" className="bg-sivac-bg-surface text-sivac-light">Desarrollo Temático</option>
                <option value="Uso de Laboratorio" className="bg-sivac-bg-surface text-sivac-light">Uso de Laboratorio</option>
                <option value="Cierre y Firma" className="bg-sivac-bg-surface text-sivac-light">Cierre y Firma</option>
              </select>
            </div>

            {}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length > 0) setUploadedFiles(prev => [...prev, ...files]);
              }}
              onClick={() => document.getElementById('evidence-file-input')?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-sivac-blue bg-sivac-blue/10 shadow-inner shadow-sivac-blue/5'
                  : 'border-white/15 bg-white/[0.03] hover:border-sivac-blue/50 hover:bg-white/[0.05]'
              }`}
            >
              <input
                id="evidence-file-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) setUploadedFiles(prev => [...prev, ...files]);
                  e.target.value = '';
                }}
              />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isDragging ? 'bg-sivac-blue/20 text-sivac-blue' : 'bg-white/5 text-sivac-muted'
              }`}>
                <Upload size={24} strokeWidth={1.5} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-14 font-semibold text-sivac-light">
                  Arrastra tus fotos aquí o haz clic para explorar
                </p>
                <p className="text-12 text-sivac-dim">
                  JPG, PNG o WebP — Máximo 10 MB por archivo
                </p>
              </div>
            </div>

            {}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-12 font-bold text-sivac-muted uppercase tracking-wide-06">
                  {uploadedFiles.length} {uploadedFiles.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
                </p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-12 text-sivac-body"
                    >
                      <ImagePlus size={14} className="text-sivac-blue shrink-0" />
                      <span className="truncate max-w-[140px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-sivac-muted hover:text-sivac-red transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setUploadedFiles([]);
                  setShowUploadModal(false);
                }}
                className="h-[40px] px-5 rounded-lg border border-sivac-border text-13 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={uploadedFiles.length === 0}
                onClick={async () => {
                  setHasEvidences(true);
                  if (visitaId) {
                    try {
                      const { createClient } = await import("@/utils/supabase/client");
                      const supabase = createClient();
                      for (const file of uploadedFiles) {
                        const base64Data = await fileToBase64(file);
                        await supabase.from("evidencias_fotos").insert({
                          visita_id: visitaId,
                          seccion: uploadSection,
                          url_foto: base64Data,
                          fecha_captura: new Date().toISOString(),
                        });
                      }
                      
                      
                      await finalizeInspection(true, true);
                    } catch (err) {
                      console.error("Error al subir fotos:", err);
                    }
                  }
                  setUploadedFiles([]);
                  setShowUploadModal(false);
                  setShowEvidenceSuccessModal(true);
                }}
                className={`h-[44px] px-6 rounded-lg text-13 font-bold text-sivac-surface transition-all uppercase tracking-wider cursor-pointer ${
                  uploadedFiles.length === 0
                    ? 'bg-sivac-blue/40 cursor-not-allowed shadow-none'
                    : 'bg-sivac-blue hover:bg-blue-700 shadow-lg shadow-sivac-blue/15'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Upload size={16} />
                  Subir y Guardar
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showEvidenceSuccessModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface/80 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative backdrop-blur-xl animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-sivac-green/15 text-sivac-green mx-auto flex items-center justify-center border border-sivac-green/30">
              <CheckCircle2 size={36} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-20 font-bold font-poppins text-sivac-heading leading-tight">
                ¡Evidencias Guardadas!
              </h3>
              <p className="text-13 leading-relaxed text-sivac-body">
                Las fotografías se han asociado correctamente a esta inspección. La auditoría ha sido finalizada con éxito.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEvidenceSuccessModal(false);
                  setCurrentStep(1);
                  router.push('/admin/visitas');
                }}
                className="w-full h-[44px] bg-sivac-blue hover:bg-blue-700 text-sivac-surface rounded-lg text-13 font-bold transition-colors uppercase tracking-wider"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
