







export type UserRole = "Admin" | "Auditor" | "Docente";


export const ROL_ACTIVO: UserRole = "Admin";




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


export const currentUser: MockUser = MOCK_USERS[ROL_ACTIVO];






export function tieneAcceso(rolesPermitidos: UserRole[]): boolean {
  return rolesPermitidos.includes(ROL_ACTIVO);
}


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
