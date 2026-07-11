"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Building2, Calendar, BookOpen, Clock, Trash2, Plus, PenTool, RotateCcw, X } from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";
import { useAuth } from "@/lib/AuthContext";

export default function ConfigurableSettingsPage() {
  const { user } = useAuth();
  const [sedes, setSedes] = useState<{ id: number; nombre: string }[]>([]);
  const [cursos, setCursos] = useState<{ id: number; nombre: string }[]>([]);
  const [ciclos, setCiclos] = useState<{ id: number; nombre: string }[]>([]);
  const [turnos, setTurnos] = useState<{ id: number; nombre: string }[]>([]);
  const [aulas, setAulas] = useState<{ id: number; nombre: string; sede_id: number | null }[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Estados para modal de Nueva Aula
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [newAulaSedeId, setNewAulaSedeId] = useState("");
  const [newAulaNombre, setNewAulaNombre] = useState("");

  const handleOpenAulaModal = () => {
    setNewAulaSedeId("");
    setNewAulaNombre("");
    setIsAulaModalOpen(true);
  };

  const handleCloseAulaModal = () => {
    setIsAulaModalOpen(false);
  };

  // Estados para modal genérico (Sedes, Ciclos, Asignaturas, Turnos)
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericModalType, setGenericModalType] = useState<"sedes" | "ciclos" | "asignaturas" | "turnos">("sedes");
  const [genericModalLabel, setGenericModalLabel] = useState("");
  const [genericModalValue, setGenericModalValue] = useState("");

  const handleOpenGenericModal = (type: "sedes" | "ciclos" | "asignaturas" | "turnos", label: string) => {
    setGenericModalType(type);
    setGenericModalLabel(label);
    setGenericModalValue("");
    setIsGenericModalOpen(true);
  };

  const handleCloseGenericModal = () => {
    setIsGenericModalOpen(false);
  };

  const [firmaUrl, setFirmaUrl] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showHeaderSaveSuccess, setShowHeaderSaveSuccess] = useState(false);

  const isAdmin = user?.rol === "Admin";

  // Cargar configuraciones reales de Supabase
  const fetchSettings = async () => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const [resSedes, resCursos, resCiclos, resTurnos, resAulas] = await Promise.all([
        supabase.from("sedes").select("id, nombre").order("nombre"),
        supabase.from("asignaturas").select("id, nombre").order("nombre"),
        supabase.from("ciclos").select("id, nombre").order("nombre"),
        supabase.from("turnos").select("id, nombre").order("nombre"),
        supabase.from("aulas").select("id, nombre, sede_id").order("nombre"),
      ]);

      if (resSedes.data) setSedes(resSedes.data);
      if (resCursos.data) setCursos(resCursos.data);
      if (resCiclos.data) setCiclos(resCiclos.data);
      if (resTurnos.data) setTurnos(resTurnos.data);
      if (resAulas.data) setAulas(resAulas.data);
    } catch (err) {
      console.error("Error al cargar configuraciones:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveNewAula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAulaSedeId) {
      alert("Por favor, seleccione una sede.");
      return;
    }
    if (!newAulaNombre.trim()) {
      alert("Por favor, ingrese el nombre del aula.");
      return;
    }

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("aulas").insert({
        nombre: newAulaNombre.trim(),
        sede_id: parseInt(newAulaSedeId, 10),
      });

      if (error) {
        alert(`Error al agregar Aula: ${error.message}`);
      } else {
        fetchSettings();
        setIsAulaModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (table: string, id: number, label: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar esta ${label}?`)) return;

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        if (error.code === "23503" || error.message.includes("foreign key constraint")) {
          const { data: itemData } = await supabase.from(table).select("nombre").eq("id", id).single();
          if (itemData && itemData.nombre) {
            const currentName = itemData.nombre;
            if (currentName.endsWith(" (Inactivo)")) {
              alert(`Esta ${label} ya se encuentra inactiva.`);
              return;
            }

            const confirmDeactivate = confirm(
              `No se puede eliminar esta ${label} porque ya ha sido utilizada en visitas existentes.\n\n` +
              `¿Deseas desactivarla (borrado lógico)? Dejará de aparecer en los selectores para nuevas visitas pero se mantendrá en el historial.`
            );

            if (confirmDeactivate) {
              const { error: updateError } = await supabase
                .from(table)
                .update({ nombre: `${currentName} (Inactivo)` })
                .eq("id", id);

              if (updateError) {
                alert(`Error al desactivar la ${label}: ${updateError.message}`);
              } else {
                fetchSettings();
              }
            }
          } else {
            alert(`Error al eliminar ${label}: ${error.message}`);
          }
        } else {
          alert(`Error al eliminar ${label}: ${error.message}`);
        }
      } else {
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivateItem = async (table: string, id: number, currentName: string, label: string) => {
    const cleanName = currentName.replace(" (Inactivo)", "");
    if (!confirm(`¿Estás seguro de que deseas reactivar esta ${label} ("${cleanName}")?`)) return;

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { error } = await supabase
        .from(table)
        .update({ nombre: cleanName })
        .eq("id", id);

      if (error) {
        alert(`Error al reactivar la ${label}: ${error.message}`);
      } else {
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveGenericItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericModalValue.trim()) {
      alert(`Por favor, ingrese el nombre para la ${genericModalLabel}.`);
      return;
    }

    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { error } = await supabase
        .from(genericModalType)
        .insert({ nombre: genericModalValue.trim() });

      if (error) {
        alert(`Error al agregar ${genericModalLabel}: ${error.message}`);
      } else {
        fetchSettings();
        setIsGenericModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSedeNameById = (id: number | null) => {
    if (!id) return "Sin Sede";
    const found = sedes.find(s => s.id === id);
    return found ? found.nombre : "Sin Sede";
  };

  // Cargar firma guardada de localStorage al iniciar
  useEffect(() => {
    if (user?.id) {
      const savedFirma = localStorage.getItem(`sivac_signature_user_${user.id}`);
      if (savedFirma) {
        setFirmaUrl(savedFirma);
      }
    }
  }, [user]);

  // Dibujar firma guardada en el canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (firmaUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = firmaUrl;
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [firmaUrl, user, loadingSettings]);

  // Escuchar enfoque de ventana/pestaña para asegurar el redibujado
  useEffect(() => {
    const handleFocus = () => {
      if (user?.id) {
        const savedFirma = localStorage.getItem(`sivac_signature_user_${user.id}`);
        if (savedFirma) {
          setFirmaUrl(savedFirma);
        }
      }
    };
    window.addEventListener("focus", handleFocus);
    const timer = setTimeout(handleFocus, 300);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(timer);
    };
  }, [user]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setFirmaUrl("");
        if (user?.id) {
          localStorage.removeItem(`sivac_signature_user_${user.id}`);
        }
      }
    }
  };

  const saveFirma = () => {
    const canvas = canvasRef.current;
    if (canvas && user?.id) {
      const dataUrl = canvas.toDataURL();
      localStorage.setItem(`sivac_signature_user_${user.id}`, dataUrl);
      setFirmaUrl(dataUrl);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 font-inter text-sivac-light bg-sivac-bg-primary min-h-[400px]">
        <Clock size={28} className="text-sivac-blue animate-spin" />
        <p className="text-13 text-sivac-muted">Cargando configuraciones institucionales...</p>
      </div>
    );
  }

  return (
    <AccessGuard allowedRoles={["Admin", "Auditor"]}>
      <div className="space-y-8 font-inter">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-28 font-bold font-poppins text-sivac-light">
            Configuración del Sistema
          </h1>
          <p className="text-14 font-normal text-sivac-body mt-1">
            {isAdmin 
              ? "Administración de listas desplegables, parámetros globales y catálogos institucionales."
              : "Parámetros globales y configuración de firma de supervisor."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            {showHeaderSaveSuccess && (
              <span className="text-12 text-sivac-green font-semibold bg-sivac-green/10 border border-sivac-green/20 px-3 py-2 rounded-lg animate-fadeIn">
                ✓ Todo sincronizado con Supabase
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setShowHeaderSaveSuccess(true);
                setTimeout(() => setShowHeaderSaveSuccess(false), 3000);
              }}
              className="h-[40px] px-5 bg-sivac-green hover:bg-green-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06 shadow-lg shadow-sivac-green/10 cursor-pointer"
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid 2 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card: Mi Firma de Auditor */}
        <div className="admin-card p-6 flex flex-col justify-between space-y-4 md:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
                <PenTool size={18} strokeWidth={2} className="text-sivac-blue-light" />
                Mi Firma Digital (Auditor / Responsable)
              </h3>
              
              <button
                type="button"
                onClick={clearCanvas}
                className="text-11 text-sivac-muted hover:text-sivac-red-light transition-colors flex items-center gap-1 hover:bg-white/5 px-2 py-1 rounded cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Limpiar Firma</span>
              </button>
            </div>

            <p className="text-13 text-sivac-body">
              Dibuja tu firma en el lienzo de abajo. Esta firma se guardará de forma persistente en tu navegador y se estampará automáticamente en el campo del Responsable cuando finalices o imprimas un reporte.
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Canvas area */}
              <div className="relative bg-sivac-bg-input-admin border border-white/10 rounded-lg overflow-hidden h-[180px] w-full max-w-[400px] flex items-center justify-center cursor-crosshair group shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full"
                />
                {!firmaUrl && !isDrawing && (
                  <span className="text-12 text-sivac-dim pointer-events-none select-none">
                    Dibuja tu firma digital aquí
                  </span>
                )}
              </div>

              {/* Status & Save Button */}
              <div className="flex-1 space-y-4 w-full md:w-auto">
                <div className="space-y-1">
                  <span className="block text-11 text-sivac-muted font-bold uppercase tracking-wider">Estado de Firma</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${firmaUrl ? 'bg-sivac-green animate-pulse' : 'bg-sivac-yellow'}`} />
                    <span className="text-13 font-semibold text-sivac-light">
                      {firmaUrl ? 'Firma Registrada' : 'Sin Registrar'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={saveFirma}
                    className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 text-sivac-surface rounded-lg text-13 font-bold transition-all uppercase tracking-wider shadow-lg shadow-sivac-blue/15 cursor-pointer"
                  >
                    Guardar Firma
                  </button>

                  {showSaveSuccess && (
                    <div className="flex items-center text-sivac-green text-12 font-medium bg-sivac-green/10 border border-sivac-green/20 px-3 py-2 rounded-lg animate-fadeIn">
                      ✓ Firma guardada con éxito
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <>
            {/* Col 1, Card 1: Sedes */}
            <div className="admin-card p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
                  <Building2 size={18} strokeWidth={2} className="text-sivac-indigo" />
                  Sedes Institucionales
                </h3>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {sedes.map((sede) => (
                    <div
                      key={sede.id}
                      className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                    >
                      {sede.nombre.endsWith(" (Inactivo)") ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sivac-muted line-through">{sede.nombre.replace(" (Inactivo)", "")}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                        </div>
                      ) : (
                        <span>{sede.nombre}</span>
                      )}
                      {sede.nombre.endsWith(" (Inactivo)") ? (
                        <button
                          type="button"
                          onClick={() => handleReactivateItem("sedes", sede.id, sede.nombre, "Sede")}
                          className="text-sivac-muted hover:text-sivac-green transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Reactivar Sede"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem("sedes", sede.id, "Sede")}
                          className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Eliminar Sede"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenGenericModal("sedes", "Sede")}
                className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {ciclos.map((ciclo) => (
                    <div
                      key={ciclo.id}
                      className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                    >
                      {ciclo.nombre.endsWith(" (Inactivo)") ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sivac-muted line-through">{ciclo.nombre.replace(" (Inactivo)", "")}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                        </div>
                      ) : (
                        <span>{ciclo.nombre}</span>
                      )}
                      {ciclo.nombre.endsWith(" (Inactivo)") ? (
                        <button
                          type="button"
                          onClick={() => handleReactivateItem("ciclos", ciclo.id, ciclo.nombre, "Ciclo")}
                          className="text-sivac-muted hover:text-sivac-green transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Reactivar Ciclo"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem("ciclos", ciclo.id, "Ciclo")}
                          className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Eliminar Ciclo"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenGenericModal("ciclos", "Ciclo")}
                className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {cursos.map((curso) => (
                    <div
                      key={curso.id}
                      className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                    >
                      {curso.nombre.endsWith(" (Inactivo)") ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sivac-muted line-through">{curso.nombre.replace(" (Inactivo)", "")}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                        </div>
                      ) : (
                        <span>{curso.nombre}</span>
                      )}
                      {curso.nombre.endsWith(" (Inactivo)") ? (
                        <button
                          type="button"
                          onClick={() => handleReactivateItem("asignaturas", curso.id, curso.nombre, "Asignatura")}
                          className="text-sivac-muted hover:text-sivac-green transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Reactivar Asignatura"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem("asignaturas", curso.id, "Asignatura")}
                          className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Eliminar Asignatura"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenGenericModal("asignaturas", "Asignatura")}
                className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {turnos.map((turno) => (
                    <div
                      key={turno.id}
                      className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                    >
                      {turno.nombre.endsWith(" (Inactivo)") ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sivac-muted line-through">{turno.nombre.replace(" (Inactivo)", "")}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                        </div>
                      ) : (
                        <span>{turno.nombre}</span>
                      )}
                      {turno.nombre.endsWith(" (Inactivo)") ? (
                        <button
                          type="button"
                          onClick={() => handleReactivateItem("turnos", turno.id, turno.nombre, "Turno")}
                          className="text-sivac-muted hover:text-sivac-green transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Reactivar Turno"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem("turnos", turno.id, "Turno")}
                          className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Eliminar Turno"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenGenericModal("turnos", "Turno")}
                className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                Agregar Turno
              </button>
            </div>

            {/* Col 1, Card 3: Aulas */}
            <div className="admin-card p-6 flex flex-col justify-between space-y-4 md:col-span-2">
              <div className="space-y-3">
                <h3 className="text-16 font-bold text-sivac-light flex items-center gap-2">
                  <Building2 size={18} strokeWidth={2} className="text-sivac-indigo" />
                  Aulas / Laboratorios
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {aulas.map((aula) => (
                    <div
                      key={aula.id}
                      className="flex items-center justify-between p-3 bg-sivac-bg-input-admin border border-sivac-border-card rounded-lg text-14 text-sivac-light hover:border-sivac-muted/30 transition-colors font-medium"
                    >
                      {aula.nombre.endsWith(" (Inactivo)") ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sivac-muted line-through">{`${aula.nombre.replace(" (Inactivo)", "")} (${getSedeNameById(aula.sede_id).split(" - ")[0].replace(" (Inactivo)", "")})`}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                        </div>
                      ) : (
                        <span>{`${aula.nombre} (${getSedeNameById(aula.sede_id).split(" - ")[0]})`}</span>
                      )}
                      {aula.nombre.endsWith(" (Inactivo)") ? (
                        <button
                          type="button"
                          onClick={() => handleReactivateItem("aulas", aula.id, aula.nombre, "Aula")}
                          className="text-sivac-muted hover:text-sivac-green transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Reactivar Aula"
                        >
                          <RotateCcw size={16} strokeWidth={2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem("aulas", aula.id, "Aula")}
                          className="text-sivac-muted hover:text-sivac-red transition-colors p-1 hover:bg-sivac-bg-secondary rounded cursor-pointer"
                          title="Eliminar Aula"
                        >
                          <Trash2 size={16} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAulaModal}
                className="h-[36px] w-full border border-sivac-blue text-sivac-blue hover:bg-sivac-blue/10 rounded-lg text-13 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                Agregar Aula / Laboratorio
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal para Crear Nueva Aula */}
      {isAulaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-sivac-light no-print">
          <div className="w-full max-w-md bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-2xl p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseAulaModal}
              className="absolute top-4 right-4 text-sivac-muted hover:text-sivac-light transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-20 font-bold font-poppins text-sivac-light mb-4 flex items-center gap-2">
              <Building2 size={22} className="text-sivac-blue-light" />
              Agregar Aula / Laboratorio
            </h2>

            <form onSubmit={handleSaveNewAula} className="space-y-4">
              <div>
                <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                  Sede Académica
                </label>
                <select
                  required
                  value={newAulaSedeId}
                  onChange={(e) => setNewAulaSedeId(e.target.value)}
                  className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                >
                  <option value="">Seleccione una sede...</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                  Nombre del Aula / Laboratorio
                </label>
                <input
                  type="text"
                  required
                  value={newAulaNombre}
                  onChange={(e) => setNewAulaNombre(e.target.value)}
                  placeholder="Ej. Aula B-402"
                  className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue placeholder:text-sivac-dim"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAulaModal}
                  className="h-[40px] px-5 rounded-lg border border-sivac-border text-13 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[40px] px-6 rounded-lg text-13 font-bold transition-all uppercase tracking-wider bg-sivac-blue hover:bg-blue-700 text-sivac-surface shadow-lg shadow-sivac-blue/15 cursor-pointer"
                >
                  Guardar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Item Genérico (Sedes, Ciclos, Asignaturas, Turnos) */}
      {isGenericModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-sivac-light no-print">
          <div className="w-full max-w-md bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-2xl p-6 relative animate-fadeIn">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseGenericModal}
              className="absolute top-4 right-4 text-sivac-muted hover:text-sivac-light transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-20 font-bold font-poppins text-sivac-light mb-4 flex items-center gap-2">
              <Plus size={22} className="text-sivac-blue-light" />
              Agregar {genericModalLabel}
            </h2>

            <form onSubmit={handleSaveGenericItem} className="space-y-4">
              <div>
                <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                  Nombre de la {genericModalLabel}
                </label>
                <input
                  type="text"
                  required
                  value={genericModalValue}
                  onChange={(e) => setGenericModalValue(e.target.value)}
                  placeholder={`Ej. Nombre de la ${genericModalLabel}`}
                  className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue placeholder:text-sivac-dim"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseGenericModal}
                  className="h-[40px] px-5 rounded-lg border border-sivac-border text-13 font-semibold text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-toggle transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-[40px] px-6 rounded-lg text-13 font-bold transition-all uppercase tracking-wider bg-sivac-blue hover:bg-blue-700 text-sivac-surface shadow-lg shadow-sivac-blue/15 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
