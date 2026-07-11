"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Eye, Edit2, ChevronLeft, ChevronRight, Check, X, Play, FileDown, Trash2, Loader2, Camera } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { createClient } from "@/utils/supabase/client";

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
}

// Número de registros por página
const PAGE_SIZE = 10;

export default function VisitasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const supabase = createClient();

  // --- Estado ---
  const [allVisits, setAllVisits] = React.useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(true);

  // Filtros controlados
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sedeFilter, setSedeFilter] = React.useState("all");
  const [estadoFilter, setEstadoFilter] = React.useState("all");

  // Sedes dinámicas desde Supabase
  const [sedes, setSedes] = React.useState<{ id: number; nombre: string }[]>([]);

  // Paginación
  const [currentPage, setCurrentPage] = React.useState(1);

  // --- Cargar sedes dinámicas ---
  const fetchSedes = React.useCallback(async () => {
    const { data } = await supabase.from("sedes").select("id, nombre").order("nombre");
    if (data) setSedes(data);
  }, [supabase]);

  // --- Cargar visitas desde Supabase ---
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
          requerimientos_solicitados,
          sedes(id, nombre),
          aulas(nombre),
          docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
          evidencias_fotos(id)
        `)
        .is("deleted_at", null);

      // Los auditores solo pueden ver sus propias visitas creadas
      if (user.rol === "Auditor") {
        query = query.eq("auditor_id", parseInt(user.id, 10));
      }

      const { data: dbVisits, error } = await query.order("id", { ascending: false });

      if (error) {
        console.error("Error fetching visitas:", error);
        setLoadingVisits(false);
        return;
      }

      if (dbVisits) {
        const mappedVisits: Visit[] = dbVisits.map((item: any) => {
          let status: "green" | "yellow" | "gray" | "red" = "gray";
          let statusText = "Pendiente";

          if (item.estado_id === 2) {
            status = "yellow";
            statusText = "En progreso";
          } else if (item.estado_id === 3) {
            status = "green";
            statusText = "Completada";
          } else if (item.estado_id === 4) {
            status = "red";
            statusText = "Observada";
          }

          const hasEvidence = item.evidencias_fotos && item.evidencias_fotos.length > 0;

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
            estadoId: item.estado_id || 1,
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

  // --- Eliminación ---
  const handleDeleteVisita = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta visita de auditoría?")) return;
    try {
      const { error } = await supabase
        .from("visitas")
        .delete()
        .eq("id", parseInt(id, 10));

      if (error) {
        alert("No se pudo eliminar la visita: " + error.message);
      } else {
        setAllVisits((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar la visita:", err);
    }
  };

  // --- Efectos ---
  React.useEffect(() => {
    if (user) {
      fetchVisitas();
      fetchSedes();
    }
  }, [fetchVisitas, fetchSedes, user]);

  // --- Filtrado reactivo en cliente ---
  const filteredVisits = React.useMemo(() => {
    return allVisits.filter((visit) => {
      // Filtro de búsqueda (docente, aula, semana)
      const matchesSearch =
        searchTerm === "" ||
        visit.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `Semana ${visit.semana}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de sede (por nombre exacto)
      const matchesSede =
        sedeFilter === "all" || visit.sede === sedeFilter;

      // Filtro de estado (por estado_id)
      const matchesEstado =
        estadoFilter === "all" ||
        (estadoFilter === "1" && visit.estadoId === 1) ||
        (estadoFilter === "2" && visit.estadoId === 2) ||
        (estadoFilter === "3" && visit.estadoId === 3) ||
        (estadoFilter === "4" && visit.estadoId === 4);

      return matchesSearch && matchesSede && matchesEstado;
    });
  }, [allVisits, searchTerm, sedeFilter, estadoFilter]);

  // --- Paginación calculada ---
  const totalVisits = filteredVisits.length;
  const totalPages = Math.max(1, Math.ceil(totalVisits / PAGE_SIZE));

  // Resetear a página 1 cuando cambian los filtros
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

  // Asegurar que currentPage no exceda totalPages
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedVisits = filteredVisits.slice(startIndex, endIndex);

  // Generar los números de página a mostrar
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

      {/* Search and Filters Bar — FILTROS CONTROLADOS Y DINÁMICOS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-sivac-bg-secondary/40 p-4 rounded-lg border border-sivac-border-card">
        {/* Search — Controlado */}
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

        {/* Filter Dropdowns — Controlados y Dinámicos */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Filtro de Sede — Dinámico desde Supabase */}
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

          {/* Filtro de Estado — Valores reales de estado_id */}
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
                        {visit.status === "gray" && (
                          /* Pendiente */
                          <button
                            type="button"
                            className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                            title="Iniciar inspección"
                            onClick={() => router.push(`/admin/inspecciones?visitaId=${visit.id}`)}
                          >
                            <Play size={18} strokeWidth={2} />
                          </button>
                        )}

                        {visit.status === "yellow" && (
                          /* En progreso */
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
                          /* Completada u Observada */
                          <>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/evidencias?visitaId=${visit.id}`)}
                              className="p-1.5 text-sivac-muted hover:text-sivac-indigo transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                              title="Ver evidencias fotográficas"
                            >
                              <Camera size={18} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/reportes`)}
                              className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                              title="Ver detalles"
                            >
                              <Eye size={18} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/reportes`)}
                              className="p-1.5 text-sivac-muted hover:text-sivac-indigo-light transition-colors rounded-lg hover:bg-sivac-bg-secondary/40 cursor-pointer"
                              title="Descargar PDF"
                            >
                              <FileDown size={18} strokeWidth={2} />
                            </button>
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

        {/* Pagination bar — FUNCIONAL */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-sivac-border-card bg-sivac-bg-secondary/10">
          <p className="text-12 font-normal text-sivac-muted">
            Mostrando{" "}
            <span className="font-semibold text-sivac-light">
              {totalVisits === 0 ? 0 : startIndex + 1} a {Math.min(endIndex, totalVisits)}
            </span>{" "}
            de <span className="font-semibold text-sivac-light">{totalVisits}</span> visitas
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
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

            {/* Page Numbers */}
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

            {/* Next Button */}
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
    </div>
  );
}
