"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { UserPlus, Users, ShieldCheck, BookOpen, Edit2, Trash2 } from "lucide-react";

interface UserRow {
  id: string;
  names: string;
  surnames: string;
  code: string;
  email: string;
  role: "Auditor" | "Docente";
  roleVariant: "blue" | "green";
  lastAccess: string;
  dotColor: string;
}

export default function UsuariosPage() {
  const users: UserRow[] = [
    {
      id: "u-1",
      names: "Carlos Alberto",
      surnames: "Campos V.",
      code: "U19203341",
      email: "carlos.campos@utp.edu.pe",
      role: "Auditor",
      roleVariant: "blue",
      lastAccess: "Hace 2 horas",
      dotColor: "bg-sivac-blue-light",
    },
    {
      id: "u-2",
      names: "María Fernanda",
      surnames: "García L.",
      code: "U21200055",
      email: "maria.garcia@utp.edu.pe",
      role: "Docente",
      roleVariant: "green",
      lastAccess: "14 May 2026, 08:30 AM",
      dotColor: "bg-sivac-green-light",
    },
  ];

  return (
    <div className="space-y-8 font-inter">
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
              842
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
              24
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
              810
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
                  USUARIO
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
                        {user.names.charAt(0)}{user.surnames.charAt(0)}
                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-sivac-bg-card ${user.dotColor}`} />
                      </div>
                      <div>
                        <p className="text-14 font-semibold text-sivac-light">
                          {user.names}
                        </p>
                        <p className="text-12 text-sivac-muted font-normal">
                          {user.surnames}
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
                      {/* Edit */}
                      <button
                        type="button"
                        className="p-1.5 text-sivac-muted hover:text-sivac-blue transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                        title="Editar usuario"
                      >
                        <Edit2 size={18} strokeWidth={2} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="p-1.5 text-sivac-muted hover:text-sivac-red transition-colors rounded-lg hover:bg-sivac-bg-secondary/40"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
