"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "Admin" | "Auditor" | "Docente";

export interface UserProfile {
  id: string;
  nombre: string;
  rol: UserRole;
  iniciales: string;
  cargo: string;
  sede: string;
  codigo_utp: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: dbUser, error } = await supabase
        .from("usuarios")
        .select(`
          id,
          nombres,
          apellidos,
          codigo_utp,
          rol_id,
          roles (
            nombre
          )
        `)
        .eq("username", session.user.email)
        .maybeSingle();

      if (dbUser) {
        const dbRol = (dbUser.roles as any)?.nombre;
        let rolName: UserRole = "Docente";
        if (dbRol === "Administrador" || dbRol === "Admin") {
          rolName = "Admin";
        } else if (dbRol === "Auditor Académico" || dbRol === "Auditor") {
          rolName = "Auditor";
        }
        const nombreCompleto = `${dbUser.nombres || ""} ${dbUser.apellidos || ""}`.trim() || session.user.email || "Usuario";
        const iniciales = nombreCompleto
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "US";

        setUser({
          id: dbUser.id.toString(),
          nombre: nombreCompleto,
          rol: rolName,
          iniciales,
          cargo: rolName === "Admin" ? "Administrador" : rolName === "Auditor" ? "Auditor Académico" : "Docente Titular",
          sede: "UTP — Sede Central",
          codigo_utp: dbUser.codigo_utp || "",
          email: session.user.email || "",
        });
      } else {
        // Fallback perfil temporal si no está en la tabla usuarios de la BD pública
        setUser({
          id: "TEMP",
          nombre: session.user.email?.split("@")[0] || "Usuario",
          rol: "Docente",
          iniciales: "US",
          cargo: "Docente Titular",
          sede: "UTP — Sede Central",
          codigo_utp: "",
          email: session.user.email || "",
        });
      }
    } catch (err) {
      console.error("Error al obtener el perfil del usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        router.push("/login");
      } else if (event === "SIGNED_IN") {
        fetchProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
