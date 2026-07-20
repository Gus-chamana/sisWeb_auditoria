"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Lock, LogOut, Loader2, X, Eye, EyeOff, Sun, Moon, User } from "lucide-react";
import { getRolLabel, getRolColor } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";

export function Header() {
  const { user, loading, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [profileNombres, setProfileNombres] = useState("");
  const [profileApellidos, setProfileApellidos] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user && showProfileModal) {
      setProfileNombres(user.nombres || "");
      setProfileApellidos(user.apellidos || "");
    }
  }, [showProfileModal, user]);

  const getLastActivityTime = (v: any) => {
    let lastTime = new Date(v.created_at).getTime();
    if (v.evidencias_fotos && v.evidencias_fotos.length > 0) {
      v.evidencias_fotos.forEach((photo: any) => {
        if (photo.fecha_captura) {
          const photoTime = new Date(photo.fecha_captura).getTime();
          if (photoTime > lastTime) {
            lastTime = photoTime;
          }
        }
      });
    }
    return lastTime;
  };

  useEffect(() => {
    if (loading || !user) return;

    async function fetchUnreadCount() {
      try {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        let query = supabase
          .from("visitas")
          .select(`
            id,
            created_at,
            evidencias_fotos(fecha_captura)
          `)
          .is("deleted_at", null);

        if (user && user.rol === "Auditor") {
          query = query.eq("auditor_id", parseInt(user.id, 10));
        } else if (user && user.rol === "Docente") {
          query = query.eq("docente_id", parseInt(user.id, 10));
        }

        const { data, error } = await query;
        if (!error && data) {
          const readMapStr = localStorage.getItem("sivac_read_notifications");
          const readMap = readMapStr ? JSON.parse(readMapStr) : {};

          
          const unread = data.filter((v: any) => {
            const activityTime = getLastActivityTime(v);
            const lastSeenTime = readMap[v.id] || 0;
            return activityTime > lastSeenTime;
          }).length;

          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Error fetching unread notifications in header:", err);
      }
    }

    if (pathname === "/admin/notificaciones") {
      setUnreadCount(0);
    } else {
      fetchUnreadCount();
    }
  }, [user, loading, pathname]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword) {
      setPasswordError("Por favor ingresa la nueva contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSavingPassword(true);
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        
        try {
          const msgBuffer = new TextEncoder().encode(newPassword);
          const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
          
          await supabase
            .from("usuarios")
            .update({ password_hash: passwordHash })
            .eq("id", parseInt(user.id, 10));
        } catch (e) {
          console.error("Error updating public password_hash:", e);
        }

        setPasswordSuccess("Contraseña actualizada con éxito.");
        setNewPassword("");
        setConfirmPassword("");
        
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 1500);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNombres.trim() || !profileApellidos.trim()) {
      setProfileError("Por favor completa todos los campos.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError("");
      setProfileSuccess("");

      const result = await updateProfile(profileNombres, profileApellidos);
      if (result.success) {
        setProfileSuccess("Datos actualizados con éxito.");
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess("");
        }, 1500);
      } else {
        setProfileError(result.error || "Ocurrió un error al actualizar.");
      }
    } catch (err: any) {
      setProfileError(err.message || "Error al actualizar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !user) {
    return (
      <header className="h-[72px] bg-sivac-bg-primary border-b border-sivac-border flex items-center justify-between px-8 sticky top-0 z-20 font-inter animate-pulse">
        <div className="w-full max-w-md h-10 bg-white/5 rounded-lg" />
        <div className="w-32 h-10 bg-white/5 rounded-lg" />
      </header>
    );
  }

  const currentUser = user;

  return (
    <header className={`h-[72px] bg-sivac-bg-primary border-b border-sivac-border flex items-center justify-between px-8 sticky top-0 font-inter transition-all ${
      (showPasswordModal || showProfileModal) ? "z-[999]" : "z-20"
    }`}>
      {}
      <div className="relative w-full max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sivac-muted">
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          type="text"
          placeholder="Buscar visitas, docentes, sedes..."
          className="input-admin w-full h-[40px] pl-10 pr-4 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted"
        />
      </div>

      {}
      <div className="flex items-center gap-4">
        {}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors cursor-pointer"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={2} />
          ) : (
            <Moon size={18} strokeWidth={2} />
          )}
        </button>

        {}
        <Link
          href="/admin/notificaciones"
          className="w-10 h-10 flex items-center justify-center bg-sivac-bg-toggle border border-sivac-border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors relative"
        >
          <Bell size={18} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center bg-sivac-blue text-sivac-surface text-10 font-bold px-1 rounded-full min-w-[16px] h-4 border border-sivac-bg-toggle">
              {unreadCount}
            </span>
          )}
        </Link>

        {}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`h-10 px-4 flex items-center gap-2.5 bg-sivac-bg-toggle border rounded-xl text-sivac-body hover:text-sivac-heading transition-colors select-none cursor-pointer ${
              showDropdown ? "border-sivac-indigo text-sivac-heading" : "border-sivac-border"
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-sivac-blue/10 flex items-center justify-center text-sivac-indigo text-11 font-semibold">
              {currentUser.iniciales}
            </div>
            <span className="text-14 font-medium">{currentUser.nombre.split(" ")[0]}</span>
            <span
              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border leading-none hidden sm:inline-flex ${getRolColor(
                currentUser.rol
              )}`}
            >
              {getRolLabel(currentUser.rol)}
            </span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`text-sivac-muted transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-xl z-50 py-2.5 font-inter text-left animate-in fade-in-50 slide-in-from-top-2 duration-100">
              {}
              <div className="px-4 pb-3 border-b border-sivac-border mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sivac-blue/10 border border-sivac-blue/20 flex items-center justify-center text-sivac-indigo font-bold text-16">
                    {currentUser.iniciales}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-14 font-bold text-sivac-light truncate leading-snug">
                      {currentUser.nombre}
                    </h4>
                    <p className="text-11 text-sivac-muted truncate mt-0.5">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {}
              <div className="px-1.5 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-13 font-medium text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-secondary transition-all text-left cursor-pointer"
                >
                  <User size={15} className="text-sivac-muted" />
                  Mis Datos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    setShowPasswordModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-13 font-medium text-sivac-body hover:text-sivac-heading hover:bg-sivac-bg-secondary transition-all text-left cursor-pointer"
                >
                  <Lock size={15} className="text-sivac-muted" />
                  Cambiar Contraseña
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-13 font-medium text-sivac-red hover:bg-sivac-red/10 transition-all text-left cursor-pointer"
                >
                  <LogOut size={15} className="text-sivac-red/70" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-2xl overflow-hidden font-inter animate-in zoom-in-95 duration-150">
            {}
            <div className="px-6 py-4 border-b border-sivac-border flex items-center justify-between bg-sivac-bg-primary">
              <h3 className="text-16 font-bold font-poppins text-sivac-light flex items-center gap-2">
                <Lock size={18} className="text-sivac-blue" />
                Cambiar Contraseña
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="text-sivac-muted hover:text-sivac-light transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {}
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3.5 bg-sivac-red/10 border border-sivac-red/20 text-sivac-red-light text-12.5 rounded-lg">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3.5 bg-sivac-green/10 border border-sivac-green/20 text-sivac-green-light text-12.5 rounded-lg animate-pulse">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-12 font-semibold text-sivac-muted uppercase tracking-wide">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="input-admin w-full h-[40px] pl-3.5 pr-10 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted rounded-lg focus:border-sivac-blue outline-none"
                    disabled={savingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sivac-muted hover:text-sivac-light transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-12 font-semibold text-sivac-muted uppercase tracking-wide">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="input-admin w-full h-[40px] pl-3.5 pr-10 text-14 bg-sivac-bg-input-admin border border-sivac-border-card text-sivac-light placeholder:text-sivac-muted rounded-lg focus:border-sivac-blue outline-none"
                    disabled={savingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sivac-muted hover:text-sivac-light transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {}
              <div className="pt-4 border-t border-sivac-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordSuccess("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="h-10 px-4 rounded-lg border border-sivac-border text-sivac-body hover:text-sivac-heading text-13 font-semibold transition-colors cursor-pointer"
                  disabled={savingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 bg-sivac-blue hover:bg-blue-700 text-sivac-surface text-13 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-sivac-blue/15"
                  disabled={savingPassword}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Actualizar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-sivac-bg-surface border border-sivac-border rounded-xl shadow-2xl overflow-hidden font-inter animate-in zoom-in-95 duration-150">
            {}
            <div className="px-6 py-4 border-b border-sivac-border flex items-center justify-between bg-sivac-bg-primary">
              <h3 className="text-16 font-bold font-poppins text-sivac-light flex items-center gap-2">
                <User size={18} className="text-sivac-blue" />
                Modificar Mis Datos
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileError("");
                  setProfileSuccess("");
                }}
                className="text-sivac-muted hover:text-sivac-light transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {}
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              {profileError && (
                <div className="p-3 text-12 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg font-medium">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 text-12 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg font-medium">
                  {profileSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-12 font-bold text-sivac-body">Nombres</label>
                <input
                  type="text"
                  value={profileNombres}
                  onChange={(e) => setProfileNombres(e.target.value)}
                  className="input-admin w-full h-[40px] px-3.5 text-14 bg-sivac-bg-input-admin border border-sivac-border/50 text-sivac-light placeholder:text-sivac-muted focus:border-sivac-blue"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-12 font-bold text-sivac-body">Apellidos</label>
                <input
                  type="text"
                  value={profileApellidos}
                  onChange={(e) => setProfileApellidos(e.target.value)}
                  className="input-admin w-full h-[40px] px-3.5 text-14 bg-sivac-bg-input-admin border border-sivac-border/50 text-sivac-light placeholder:text-sivac-muted focus:border-sivac-blue"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileError("");
                    setProfileSuccess("");
                  }}
                  className="px-4 py-2 border border-sivac-border text-sivac-body text-13 font-semibold rounded-lg hover:bg-sivac-bg-secondary hover:text-sivac-heading transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-sivac-blue hover:bg-blue-700 disabled:opacity-50 text-white text-13 font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
