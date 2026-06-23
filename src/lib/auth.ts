// ============================================================
// SIVAC — Mock de Autenticación y Roles
// ============================================================
// INSTRUCCIÓN: Cambia el valor de `ROL_ACTIVO` para simular
// el comportamiento de la interfaz según cada perfil.
// Opciones: "Admin" | "Auditor" | "Docente"
// ============================================================

export type UserRole = "Admin" | "Auditor" | "Docente";

// ⬇️ CAMBIAR AQUÍ PARA PROBAR DIFERENTES ROLES ⬇️
export const ROL_ACTIVO: UserRole = "Admin";

// -----------------------------------------------------------
// Datos simulados del usuario por rol
// -----------------------------------------------------------
interface MockUser {
  nombre: string;
  id: string;
  rol: UserRole;
  iniciales: string;
  cargo: string;
  sede: string;
}

const MOCK_USERS: Record<UserRole, MockUser> = {
  Admin: {
    nombre: "Admin. Supervisor",
    id: "SUP-9021",
    rol: "Admin",
    iniciales: "AS",
    cargo: "Administrador General",
    sede: "Red Nacional — UTP",
  },
  Auditor: {
    nombre: "Carlos Mendoza Ortiz",
    id: "AUD-4502",
    rol: "Auditor",
    iniciales: "CM",
    cargo: "Auditor Académico",
    sede: "Sede Central — Lima",
  },
  Docente: {
    nombre: "María García López",
    id: "DOC-7834",
    rol: "Docente",
    iniciales: "MG",
    cargo: "Docente Titular",
    sede: "Sede Norte — Los Olivos",
  },
};

/** Usuario activo actual (derivado de ROL_ACTIVO) */
export const currentUser: MockUser = MOCK_USERS[ROL_ACTIVO];

// -----------------------------------------------------------
// Helpers de permisos
// -----------------------------------------------------------

/** Verifica si el rol activo tiene acceso a una ruta */
export function tieneAcceso(rolesPermitidos: UserRole[]): boolean {
  return rolesPermitidos.includes(ROL_ACTIVO);
}

/** Etiqueta visual para el badge del rol */
export function getRolLabel(rol: UserRole): string {
  switch (rol) {
    case "Admin":
      return "Administrador";
    case "Auditor":
      return "Auditor";
    case "Docente":
      return "Docente";
  }
}

/** Color del badge del rol (clases Tailwind) */
export function getRolColor(rol: UserRole): string {
  switch (rol) {
    case "Admin":
      return "bg-sivac-blue/15 text-sivac-blue-pale border-sivac-blue/30";
    case "Auditor":
      return "bg-sivac-green/15 text-sivac-green-light border-sivac-green/30";
    case "Docente":
      return "bg-sivac-yellow/15 text-sivac-yellow-soft border-sivac-yellow/30";
  }
}
