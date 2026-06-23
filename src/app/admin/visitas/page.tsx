"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Eye, Edit2, ChevronLeft, ChevronRight, Check, X, Play, FileDown, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface Visit {
  id: string;
  status: "green" | "yellow" | "gray" | "red";
  statusText: string;
  fecha: string;
  docente: string;
  sede: string;
  aula: string;
  semana: number;
  hasEvidence: boolean;
}

export default function VisitasPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-40 bg-white/5 rounded-lg w-full" />
      </div>
    );
  }

  const ROL_ACTIVO = user.rol;
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(true);

  const fetchVisitas = async () => {
    setLoadingVisits(true);
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();

      const { data: dbVisits, error } = await supabase
        .from("visitas")
        .select(`
          id,
          fecha_visita,
          ciclo,
          turno,
          semana_nro,
          estado_id,
          requerimientos_solicitados,
          sedes(nombre),
          aulas(nombre),
          docente:usuarios!visitas_docente_id_fkey(nombres, apellidos),
          evidencias_fotos(id)
        `)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching visitas:", error);
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
            sede: item.sedes?.nombre || "—",
            aula: item.aulas?.nombre || "—",
            semana: item.semana_nro || 1,
            hasEvidence: !!hasEvidence,
          };
        });

        setVisits(mappedVisits);
      }
    } catch (err) {
      console.error("Error al cargar las visitas:", err);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleDeleteVisita = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta visita de auditoría?")) return;
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      
      const { error } = await supabase
        .from("visitas")
        .delete()
        .eq("id", parseInt(id, 10));

      if (error) {
        alert("No se pudo eliminar la visita: " + error.message);
      } else {
        setVisits((prev) => prev.filter((v) => v.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar la visita:", err);
    }
  };

  React.useEffect(() => {
    fetchVisitas();
  }, []);

  if (loadingVisits) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/4" />
        <div className="h-40 bg-white/5 rounded-lg w-full" />
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

        <button
          type="button"
          onClick={() => router.push("?newInspection=true")}
          className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nueva Inspección</span>
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
            placeholder="Buscar docente, aula o semana..."
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
            <option>Sede Este</option>
            <option>Sede Oeste</option>
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
                  ID
                </th>
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
              {visits.map((visit) => (
                 <tr key={visit.id} className="hover:bg-sivac-bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-14 font-bold text-sivac-muted">
                    #{visit.id}
                  </td>
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
                      {visit.hasEvidence ? (
                        <span title="Tiene evidencia">
                          <Check size={20} className="text-sivac-green-light" />
                        </span>
                      ) : (
                        <span title="Sin evidencia">
                          <X size={20} className="text-sivac-red-light" />
                        </span>
                      )}
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
