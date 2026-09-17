import type { Role } from "../../types";

export type Permission =
  | "dashboard.read"
  | "dashboard.widgets.manage"
  | "hotel.read"
  | "clients.read"
  | "clients.write"
  | "messages.read"
  | "messages.send"
  | "tasks.read"
  | "tasks.update"
  | "tasks.create"
  | "instructions.read"
  | "instructions.create"
  | "events.read"
  | "events.create"
  | "admin.read"
  | "admin.write";

const rolePermissions: Record<Role, Permission[]> = {
  employee: [
    "dashboard.read","hotel.read","clients.read","messages.read","messages.send",
    "tasks.read","tasks.update","instructions.read","events.read"
  ],
  manager: [
    "dashboard.read","dashboard.widgets.manage","hotel.read","clients.read","clients.write","messages.read","messages.send",
    "tasks.read","tasks.update","tasks.create","instructions.read","instructions.create",
    "events.read","events.create"
  ],
  direction: [
    "dashboard.read","dashboard.widgets.manage","hotel.read","clients.read","clients.write","messages.read","messages.send",
    "tasks.read","tasks.update","tasks.create","instructions.read","instructions.create",
    "events.read","events.create","admin.read"
  ],
  admin: [
    "dashboard.read","dashboard.widgets.manage","hotel.read","clients.read","clients.write","messages.read","messages.send",
    "tasks.read","tasks.update","tasks.create","instructions.read","instructions.create",
    "events.read","events.create","admin.read","admin.write"
  ]
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
