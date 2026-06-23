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

  // Estado global para todo el formulario de auditoría de 7 pasos
  const [formData, setFormData] = useState({
    // Paso 1: Datos Generales
    sedeFilial: "Sede Central - Lima",
    ciclo: "2026-I",
    turno: "Noche",
    aula: "Aula B-402",
    asignatura: "Arquitectura de Software (12402)",
    semanaNo: "12",
    modalidad: "Presencial",
    docenteNombre: "Dr. Ing. Hugo Cabrera Rojas",

    // Paso 2: Control Docente
    docentePresente: "" as "Presente" | "Ausente" | "",
    horarioProgramado: "" as "Puntual" | "Impuntual" | "",
    interaccion: "" as "Interactúa" | "No Interactúa" | "",
    observacionesAusencia: "",
    actividadDocente: "",

    // Paso 3: Material Utilizado
    materialCargado: "" as "CUMPLE" | "NO CUMPLE" | "",
    observacionesMaterial: "",

    // Paso 4: Asistencia
    alumnosAmbiente: "" as number | "",
    alumnosIntranet: "" as number | "",
    observacionesAsistencia: "",

    // Paso 5: Avance Silábico
    silaboCoincide: "" as "CUMPLE" | "NO CUMPLE" | "",
    temaAnteriorCoincide: "" as "CUMPLE" | "NO CUMPLE" | "",
    ingresoSilaboVirtual: "" as "CUMPLE" | "NO CUMPLE" | "",
    observacionesSilabo: "",

    // Paso 6: Guía Práctica
    guiaPractica: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    logroMedir: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    rubricaEvaluacion: "" as "CUMPLE" | "NO CUMPLE" | "NO APLICA" | "",
    observacionesGuia: "",

    // Paso 7: Firmas
    firmaDocenteUrl: ""
  });

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const [visitaId, setVisitaId] = useState<number | null>(null);
  const { user } = useAuth();

  // Leer los parámetros de la URL para pre-llenar los datos de la inspección o recuperar la visita
  React.useEffect(() => {
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

      setFormData({
        sedeFilial: (visita.sedes as any)?.nombre || "Sede Central - Lima",
        ciclo: visita.ciclo || "2026-I",
        turno: visita.turno || "Noche",
        aula: (visita.aulas as any)?.nombre || "",
        asignatura: (visita.asignaturas as any)?.nombre || "",
        semanaNo: (visita.semana_nro || 12).toString(),
        modalidad: "Presencial",
        docenteNombre: `${(visita.docente as any)?.nombres || ""} ${(visita.docente as any)?.apellidos || ""}`.trim() || "Docente",
        docentePresente: evalControl ? (evalControl.presente_id === 4 ? "Presente" : "Ausente") : "",
        horarioProgramado: evalControl ? (evalControl.horario_id === 6 ? "Puntual" : "Impuntual") : "",
        interaccion: evalControl ? (evalControl.interaccion_id === 8 ? "Interactúa" : "No Interactúa") : "",
        observacionesAusencia: evalControl?.observaciones || "",
        actividadDocente: evalControl?.actividad_detalle || "",
        materialCargado: evalAcad ? (evalAcad.material_cumple_id === 1 ? "CUMPLE" : "NO CUMPLE") : "",
        observacionesMaterial: evalAcad?.obs_material || "",
        alumnosAmbiente: evalAsistencia ? 25 : "",
        alumnosIntranet: evalAsistencia ? 25 : "",
        observacionesAsistencia: evalAsistencia?.observaciones || "",
        silaboCoincide: evalAcad ? (evalAcad.silabo_coincide_actual_id === 1 ? "CUMPLE" : "NO CUMPLE") : "",
        temaAnteriorCoincide: evalAcad ? (evalAcad.silabo_coincide_anterior_id === 1 ? "CUMPLE" : "NO CUMPLE") : "",
        ingresoSilaboVirtual: evalAcad ? (evalAcad.silabo_virtual_id === 1 ? "CUMPLE" : "NO CUMPLE") : "",
        observacionesSilabo: evalAcad?.obs_avance_silabico || "",
        guiaPractica: evalGuia ? (evalGuia.cumple_tema_id === 1 ? "CUMPLE" : evalGuia.cumple_tema_id === 2 ? "NO CUMPLE" : "NO APLICA") : "",
        logroMedir: evalGuia ? (evalGuia.evidencia_logro_id === 1 ? "CUMPLE" : evalGuia.evidencia_logro_id === 2 ? "NO CUMPLE" : "NO APLICA") : "",
        rubricaEvaluacion: evalGuia ? (evalGuia.cuenta_rubrica_id === 1 ? "CUMPLE" : evalGuia.cuenta_rubrica_id === 2 ? "NO CUMPLE" : "NO APLICA") : "",
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

        const { data: Aula } = await supabase
          .from("aulas")
          .select("id")
          .eq("nombre", formData.aula)
          .maybeSingle();
        let aId = Aula?.id;
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

        const { data: docUser } = await supabase
          .from("usuarios")
          .select("id")
          .ilike("nombres", `%${formData.docenteNombre.split(" ")[0]}%`)
          .limit(1)
          .maybeSingle();
        
        const docId = docUser?.id || 3;

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
          estado_id: 2, // En progreso
        };

        if (currentVisitaId) {
          await supabase
            .from("visitas")
            .update(payload)
            .eq("id", currentVisitaId);
        } else {
          const { data: newVisita } = await supabase
            .from("visitas")
            .insert(payload)
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
        const interaccionId = formData.interaccion === "Interactúa" ? 8 : 9;

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
        await supabase.from("eval_academica_detalle").upsert({
          visita_id: currentVisitaId,
          material_cumple_id: cumpleId,
          obs_material: formData.observacionesMaterial,
        });
      }

      if (step === 4) {
        const ambienteId = formData.alumnosAmbiente !== "" ? 1 : 2;
        const intranetId = formData.alumnosIntranet !== "" ? 1 : 2;
        await supabase.from("eval_asistencia").upsert({
          visita_id: currentVisitaId,
          ambiente_cumple_id: ambienteId,
          intranet_cumple_id: intranetId,
          observaciones: formData.observacionesAsistencia,
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

  const finalizeInspection = async (completed: boolean) => {
    if (!visitaId) return;
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      await supabase
        .from("visitas")
        .update({
          estado_id: completed ? 3 : 2, // 3: Completada, 2: En Progreso
          ultimo_paso_completado: 7,
          firma_docente_b64: formData.firmaDocenteUrl,
        })
        .eq("id", visitaId);
    } catch (err) {
      console.error("Error al finalizar la inspección:", err);
    }
  };

  const handleNext = async () => {
    await saveStepProgress(currentStep);
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Guardar / Finalizar auditoría
      if (!hasEvidences) {
        setShowConfirmModal(true);
      } else {
        await finalizeInspection(true);
        setShowSuccessModal(true);
      }
    }
  };

  const handlePrev = () => {
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

  // Renderizar dinámicamente cada paso
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
                  onChange={(e) => updateFormData({ sedeFilial: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
                  <option value="Sede Central - Lima">Sede Central - Lima</option>
                  <option value="Sede Norte - Los Olivos">Sede Norte - Los Olivos</option>
                  <option value="Sede Sur - Chorrillos">Sede Sur - Chorrillos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Ciclo Académico</label>
                <select
                  value={formData.ciclo}
                  onChange={(e) => updateFormData({ ciclo: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
                  <option value="2026-I">Ciclo 2026-I</option>
                  <option value="2025-II">Ciclo 2025-II</option>
                  <option value="2025-I">Ciclo 2025-I</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Turno</label>
                <select
                  value={formData.turno}
                  onChange={(e) => updateFormData({ turno: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
                  <option value="Mañana">Mañana</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Aula / Laboratorio</label>
                <input
                  type="text"
                  value={formData.aula}
                  onChange={(e) => updateFormData({ aula: e.target.value })}
                  placeholder="Ej. Aula B-402"
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue placeholder:text-sivac-dim"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Asignatura del Curso</label>
                <input
                  type="text"
                  value={formData.asignatura}
                  onChange={(e) => updateFormData({ asignatura: e.target.value })}
                  placeholder="Ej. Arquitectura de Software"
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue placeholder:text-sivac-dim"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Semana Lectiva</label>
                <select
                  value={formData.semanaNo}
                  onChange={(e) => updateFormData({ semanaNo: e.target.value })}
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue"
                >
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
                  <option value="Presencial">Presencial (Laboratorio / Aula)</option>
                  <option value="Virtual">Virtual (Zoom / Teams)</option>
                  <option value="Híbrido">Híbrido (Dual)</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">Nombre del Docente</label>
                <input
                  type="text"
                  value={formData.docenteNombre}
                  onChange={(e) => updateFormData({ docenteNombre: e.target.value })}
                  placeholder="Ej. Dr. Ing. Hugo Cabrera Rojas"
                  className="h-[44px] w-full px-3.5 bg-sivac-bg-input-admin border border-white/10 rounded-lg text-14 text-sivac-light outline-none focus:border-sivac-blue placeholder:text-sivac-dim"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return <Paso2ControlDocente formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Paso3MaterialVirtual formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Paso4Asistencia formData={formData} updateFormData={updateFormData} />;
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
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-sivac-border-card pb-6">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Inspección Académica Guiada
          </h1>
          <p className="text-14 font-normal text-sivac-muted mt-1.5">
            Evaluación inopinada a docentes en aula virtual y laboratorios.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e3a8a33] border border-[#1e3a8a80] text-[#93c5fd] self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-[#60a5fa] animate-pulse" />
          <span className="text-12 font-medium">Autoguardado activado</span>
        </div>
      </div>

      {/* Progress Wizard Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-12 font-semibold text-sivac-muted">
          <span>Progreso de Auditoría</span>
          <span>Paso {currentStep} de 7 ({Math.round((currentStep / 7) * 100)}%)</span>
        </div>
        {/* Progress Bar reactiva */}
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

      {/* Step Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-20 font-bold text-sivac-light font-poppins">
          {getStepTitle()}
        </h2>
        <p className="text-13 font-normal text-sivac-muted">
          {getStepDescription()}
        </p>
      </div>

      {/* Form Content Area */}
      <div className="space-y-6">
        {renderStepContent()}
      </div>

      {/* Footer Wizard Actions */}
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

      {/* Modal de Finalización Exitoso */}
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

            {/* Banner de advertencia condicional */}
            {finishedWithoutEvidence && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left">
                <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-12 leading-relaxed text-amber-400/90">
                  <span className="font-bold">Recuerda:</span> Falta subir la evidencia fotográfica de esta inspección. No olvides completarla más tarde.
                </p>
              </div>
            )}

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

      {/* Modal de Confirmación de Evidencias (Glassmorphism / Backdrop Blur) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface/80 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative backdrop-blur-xl">
            
            {/* Warning Icon and Message */}
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-sivac-yellow/15 text-sivac-yellow mx-auto flex items-center justify-center border border-sivac-yellow/30 shrink-0">
                <Info size={28} className="text-sivac-yellow" />
              </div>
              <div className="space-y-2">
                <h3 className="text-18 font-bold font-poppins text-sivac-heading leading-tight">
                  Inspección sin Evidencias
                </h3>
                <p className="text-14 leading-relaxed text-sivac-body">
                  ⚠️ Estás a punto de finalizar la inspección sin evidencias fotográficas adjuntas.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setShowUploadModal(true);
                }}
                className="w-full sm:w-auto h-[44px] px-6 rounded-lg text-13 font-bold bg-sivac-blue hover:bg-blue-700 text-sivac-surface transition-all shadow-lg shadow-sivac-blue/15 cursor-pointer uppercase tracking-wider"
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
                className="w-full sm:w-auto h-[40px] px-5 rounded-lg text-13 font-medium text-sivac-muted hover:text-sivac-heading transition-colors cursor-pointer underline underline-offset-2 decoration-sivac-muted/40 hover:decoration-sivac-heading/60"
              >
                Finalizar y subir más tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Carga de Evidencias Fotográficas (Glassmorphism) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn text-sivac-light">
          <div className="bg-sivac-bg-surface/80 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative backdrop-blur-xl">

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-sivac-muted hover:text-sivac-heading cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Header */}
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

            {/* Drag & Drop Zone */}
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

            {/* Uploaded Files Preview */}
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

            {/* Action Buttons */}
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
                        await supabase.from("evidencias_fotos").insert({
                          visita_id: visitaId,
                          seccion: "General",
                          url_foto: `/uploads/mock_${file.name}`,
                        });
                      }
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

      {/* Modal de Éxito de Evidencias */}
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
