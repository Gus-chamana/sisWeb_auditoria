"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, Users, ShieldCheck, BookOpen, Edit2, Trash2, Loader2, X, RotateCcw } from "lucide-react";
import { AccessGuard } from "@/components/layout/AccessGuard";
import { createClient } from "@/utils/supabase/client";

interface UserRow {
  id: string;
  names: string;
  surnames: string;
  code: string;
  email: string;
  role: "Admin" | "Auditor" | "Docente";
  roleVariant: "blue" | "green" | "gray";
  lastAccess: string;
  dotColor: string;
}

export default function UsuariosPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newUsername, setNewUsername] = useState("");
  const [newNombres, setNewNombres] = useState("");
  const [newApellidos, setNewApellidos] = useState("");
  const [newCodigoUtp, setNewCodigoUtp] = useState("");
  const [newRolId, setNewRolId] = useState("3"); // Default to Docente

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select(`
          id,
          nombres,
          apellidos,
          username,
          codigo_utp,
          rol_id,
          roles (
            nombre
          )
        `)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error loading users:", error);
        return;
      }

      if (data) {
        const mapped: UserRow[] = data.map((u: any) => {
          const dbRol = u.roles?.nombre || "";
          let role: "Admin" | "Auditor" | "Docente" = "Docente";
          let roleVariant: "blue" | "green" | "gray" = "green";
          let dotColor = "bg-sivac-green-light";

          if (dbRol === "Administrador" || dbRol === "Admin") {
            role = "Admin";
            roleVariant = "gray";
            dotColor = "bg-sivac-muted";
          } else if (dbRol === "Auditor Académico" || dbRol === "Auditor") {
            role = "Auditor";
            roleVariant = "blue";
            dotColor = "bg-sivac-blue-light";
          }

          return {
            id: u.id.toString(),
            names: u.nombres || u.username.split("@")[0],
            surnames: u.apellidos || "",
            code: u.codigo_utp || "S/C",
            email: u.username,
            role,
            roleVariant,
            lastAccess: "Activo",
            dotColor,
          };
        });
        setUsers(mapped);
      }
    } catch (err) {
      console.error("Unexpected error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Pre-llenar y validar la letra inicial del código UTP según el rol
  useEffect(() => {
    if (isModalOpen) {
      const prefix = (newRolId === "1" || newRolId === "2") ? "A" : "D";
      if (!newCodigoUtp) {
        setNewCodigoUtp(prefix);
      } else {
        const rest = newCodigoUtp.slice(1).replace(/[^0-9]/g, "").slice(0, 8);
        setNewCodigoUtp(prefix + rest);
      }
    }
  }, [isModalOpen, newRolId]);

  const handleCodigoChange = (value: string) => {
    const prefix = (newRolId === "1" || newRolId === "2") ? "A" : "D";
    let clean = value;
    if (!clean.startsWith(prefix)) {
      clean = prefix + clean.replace(/^[ADad]?/, "");
    }
    // Solo permitir hasta 8 números a continuación de la letra prefijo
    const digitsOnly = clean.slice(1).replace(/[^0-9]/g, "").slice(0, 8);
    setNewCodigoUtp(prefix + digitsOnly);
  };

  const resetForm = () => {
    setNewUsername("");
    setNewNombres("");
    setNewApellidos("");
    const prefix = (newRolId === "1" || newRolId === "2") ? "A" : "D";
    setNewCodigoUtp(prefix);
  };

  const handleCloseModalWithCheck = () => {
    const prefix = (newRolId === "1" || newRolId === "2") ? "A" : "D";
    const hasData =
      newUsername.trim() !== "" ||
      newNombres.trim() !== "" ||
      newApellidos.trim() !== "" ||
      newCodigoUtp !== prefix;

    if (hasData) {
      const confirmAbandon = window.confirm(
        "¿Estás seguro de que deseas abandonar la creación del usuario?"
      );
      if (!confirmAbandon) return;
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validar que se ingresen ambos apellidos (paterno y materno)
      const cleanApellidos = newApellidos.trim();
      const apellidosWords = cleanApellidos ? cleanApellidos.split(/\s+/) : [];
      if (apellidosWords.length < 2) {
        alert("Debe ingresar ambos apellidos (paterno y materno).");
        return;
      }

      const prefix = (newRolId === "1" || newRolId === "2") ? "A" : "D";
      const digits = newCodigoUtp.slice(1);
      if (digits.length !== 8) {
        alert("El código UTP debe tener exactamente 8 números.");
        setNewCodigoUtp(prefix); // Solo borramos el código
        return;
      }

      // Validar código UTP único en la base de datos
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("codigo_utp", newCodigoUtp.trim())
        .limit(1);

      if (checkError) {
        console.error("Error al validar código UTP:", checkError);
      } else if (existingUser && existingUser.length > 0) {
        alert("El código UTP ya está registrado por otro usuario.");
        setNewCodigoUtp(prefix); // Solo borramos el código
        return;
      }

      // 1. Registrar credenciales en Supabase Auth (usando cliente sin persistencia para no desloguear al admin)
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      const tempSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );

      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: newUsername.trim(),
        password: "Sivac2025!",
      });

      if (authError) {
        alert("Error al registrar credenciales en Supabase Auth: " + authError.message);
        resetForm();
        return;
      }

      // 2. Insertar perfil en la tabla de usuarios pública
      const { error } = await supabase
        .from("usuarios")
        .insert([
          {
            username: newUsername.trim(),
            nombres: newNombres,
            apellidos: newApellidos,
            codigo_utp: newCodigoUtp.trim(),
            rol_id: parseInt(newRolId),
            password_hash: "Sivac2025!", // Satisfacer restricción NOT NULL
          }
        ]);

      if (error) {
        alert("Error al crear usuario: " + error.message);
        resetForm();
      } else {
        await fetchUsers();
        setIsModalOpen(false);
        // Clear fields
        setNewUsername("");
        setNewNombres("");
        setNewApellidos("");
        setNewCodigoUtp("");
        setNewRolId("3");
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
      resetForm();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este usuario?")) return;
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (error) {
        if (error.code === "23503" || error.message.includes("foreign key constraint")) {
          const { data: userData } = await supabase
            .from("usuarios")
            .select("nombres, apellidos")
            .eq("id", id)
            .single();

          if (userData) {
            const currentApellidos = userData.apellidos;
            if (currentApellidos.endsWith(" (Inactivo)")) {
              alert("Este usuario ya se encuentra inactivo.");
              return;
            }

            const confirmDeactivate = confirm(
              "No se puede eliminar este usuario porque ya está registrado en visitas pasadas.\n\n" +
              "¿Deseas desactivarlo (borrado lógico)? Dejará de aparecer en la lista para programar nuevas visitas pero se mantendrá en el historial."
            );

            if (confirmDeactivate) {
              const { error: updateError } = await supabase
                .from("usuarios")
                .update({ apellidos: `${currentApellidos} (Inactivo)` })
                .eq("id", id);

              if (updateError) {
                alert("Error al desactivar el usuario: " + updateError.message);
              } else {
                await fetchUsers();
              }
            }
          } else {
            alert("Error al eliminar el usuario: " + error.message);
          }
        } else {
          alert("Error al eliminar el usuario: " + error.message);
        }
      } else {
        await fetchUsers();
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    }
  };

  const handleReactivateUser = async (id: string, currentSurnames: string) => {
    const cleanSurnames = currentSurnames.replace(" (Inactivo)", "");
    if (!confirm(`¿Está seguro de que desea reactivar este usuario ("${cleanSurnames}")?`)) return;

    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ apellidos: cleanSurnames })
        .eq("id", id);

      if (error) {
        alert("Error al reactivar el usuario: " + error.message);
      } else {
        await fetchUsers();
      }
    } catch (err: any) {
      alert("Error inesperado: " + err.message);
    }
  };

  // KPIs
  const totalCount = users.length;
  const auditorsCount = users.filter((u) => u.role === "Auditor").length;
  const docentesCount = users.filter((u) => u.role === "Docente").length;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-180px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="text-sivac-blue animate-spin" />
          <p className="text-14 text-sivac-muted">Cargando gestión de usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <AccessGuard allowedRoles={["Admin"]}>
      <div className="space-y-8 font-inter relative">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-28 font-bold font-poppins text-sivac-light">
              Gestión de Usuarios
            </h1>
            <p className="text-14 font-normal text-sivac-body mt-1">
              Administración de accesos, roles, permisos y consulta de actividad de usuarios en el sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-[40px] px-5 bg-sivac-blue hover:bg-blue-700 rounded-lg text-14 text-sivac-surface transition-colors flex items-center gap-2 font-bold uppercase tracking-wide-06"
          >
            <UserPlus size={16} strokeWidth={2.5} />
            <span>Crear Usuario</span>
          </button>
        </div>

        {/* 3 Stat Boxes Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total */}
          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                TOTAL USUARIOS
              </p>
              <p className="text-32 font-bold text-sivac-light mt-1.5 leading-none">
                {totalCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sivac-bg-secondary text-sivac-muted">
              <Users size={20} strokeWidth={2} />
            </div>
          </div>

          {/* Auditores */}
          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                AUDITORES ACTIVOS
              </p>
              <p className="text-32 font-bold text-sivac-blue-light mt-1.5 leading-none">
                {auditorsCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sivac-blue/10 text-sivac-blue-light">
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
          </div>

          {/* Docentes */}
          <div className="admin-card p-5 flex items-center justify-between">
            <div>
              <p className="text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                DOCENTES (UTP)
              </p>
              <p className="text-32 font-bold text-sivac-green-light mt-1.5 leading-none">
                {docentesCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sivac-green/10 text-sivac-green-light">
              <BookOpen size={20} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sivac-bg-input-admin border-b border-sivac-border-card">
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                    NOMBRES Y APELLIDOS
                  </th>
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                    CÓDIGO UTP
                  </th>
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                    USUARIO (EMAIL)
                  </th>
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                    ROL
                  </th>
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase">
                    ÚLTIMO ACCESO
                  </th>
                  <th className="px-6 py-4 text-12 font-bold text-sivac-muted tracking-wide-06 uppercase text-center">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sivac-border-card">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-sivac-bg-secondary/20 transition-colors">
                    {/* Name and avatar dot */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sivac-bg-secondary flex items-center justify-center relative border border-sivac-border-card text-sivac-indigo font-bold text-12">
                          {user.names.charAt(0)}{user.surnames ? user.surnames.charAt(0) : ""}
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-sivac-bg-card ${user.dotColor}`} />
                        </div>
                        <div>
                          <p className="text-14 font-semibold text-sivac-light">
                            {user.names}
                          </p>
                          <p className="text-12 text-sivac-muted font-normal">
                            {user.surnames.endsWith(" (Inactivo)") ? (
                              <span className="flex items-center gap-1.5">
                                <span className="line-through">{user.surnames.replace(" (Inactivo)", "")}</span>
                                <span className="text-[10px] font-bold uppercase bg-sivac-red/10 border border-sivac-red/20 text-sivac-red px-1.5 py-0.5 rounded animate-fadeIn">Inactivo</span>
                              </span>
                            ) : (
                              user.surnames
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data">
                      {user.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-data">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.roleVariant}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-14 text-sivac-muted font-normal">
                      {user.lastAccess}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* Delete/Reactivate */}
                        {user.surnames.endsWith(" (Inactivo)") ? (
                          <button
                            type="button"
                            onClick={() => handleReactivateUser(user.id, user.surnames)}
                            className="p-1.5 text-sivac-muted hover:text-sivac-green transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                            title="Reactivar usuario"
                          >
                            <RotateCcw size={18} strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 text-sivac-muted hover:text-sivac-red transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-2xl p-6 relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModalWithCheck}
                className="absolute top-4 right-4 text-sivac-muted hover:text-sivac-light transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-20 font-bold font-poppins text-sivac-light mb-4">
                Crear Nuevo Usuario
              </h2>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                    Correo Institucional (Email)
                  </label>
                  <input
                    type="email"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej. supervisor@utp.edu.pe"
                    className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                      Nombres
                    </label>
                    <input
                      type="text"
                      required
                      value={newNombres}
                      onChange={(e) => setNewNombres(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "").replace(/^[-\s']+/g, "").replace(/-+/g, "-").replace(/\s+/g, " ").replace(/'+/g, "'"))}
                      placeholder="Nombres"
                      className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      required
                      value={newApellidos}
                      onChange={(e) => setNewApellidos(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "").replace(/^[-\s']+/g, "").replace(/-+/g, "-").replace(/\s+/g, " ").replace(/'+/g, "'"))}
                      placeholder="Apellidos"
                      className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                    Código UTP
                  </label>
                  <input
                    type="text"
                    required
                    value={newCodigoUtp}
                    onChange={(e) => handleCodigoChange(e.target.value)}
                    placeholder="ej. D19203341"
                    className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue font-mono"
                  />
                </div>

                <div>
                  <label className="block text-11 font-bold text-sivac-muted uppercase mb-1">
                    Rol en la plataforma
                  </label>
                  <select
                    value={newRolId}
                    onChange={(e) => setNewRolId(e.target.value)}
                    className="w-full h-[40px] px-3 bg-sivac-bg-input-admin border border-sivac-border rounded text-13 text-sivac-light focus:outline-none focus:border-sivac-blue cursor-pointer"
                  >
                    <option value="1">Administrador</option>
                    <option value="2">Auditor Académico</option>
                    <option value="3">Docente</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModalWithCheck}
                    className="flex-1 h-[40px] border border-sivac-border hover:bg-sivac-bg-secondary text-sivac-body rounded font-bold text-12 uppercase tracking-wide transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-[40px] bg-sivac-blue hover:bg-blue-700 text-white rounded font-bold text-12 uppercase tracking-wide transition-colors"
                  >
                    Guardar Usuario
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
