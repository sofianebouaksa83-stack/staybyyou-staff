import type {
  LegacyRole,
  Role,
} from "../../types";

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

const rolePermissions: Record<
  LegacyRole,
  Permission[]
> = {
  employee: [
    "dashboard.read",
    "hotel.read",
    "clients.read",
    "messages.read",
    "messages.send",
    "tasks.read",
    "tasks.update",
    "instructions.read",
    "events.read",
  ],

  manager: [
    "dashboard.read",
    "dashboard.widgets.manage",
    "hotel.read",
    "clients.read",
    "clients.write",
    "messages.read",
    "messages.send",
    "tasks.read",
    "tasks.update",
    "tasks.create",
    "instructions.read",
    "instructions.create",
    "events.read",
    "events.create",
  ],

  direction: [
    "dashboard.read",
    "dashboard.widgets.manage",
    "hotel.read",
    "clients.read",
    "clients.write",
    "messages.read",
    "messages.send",
    "tasks.read",
    "tasks.update",
    "tasks.create",
    "instructions.read",
    "instructions.create",
    "events.read",
    "events.create",
    "admin.read",
  ],

  admin: [
    "dashboard.read",
    "dashboard.widgets.manage",
    "hotel.read",
    "clients.read",
    "clients.write",
    "messages.read",
    "messages.send",
    "tasks.read",
    "tasks.update",
    "tasks.create",
    "instructions.read",
    "instructions.create",
    "events.read",
    "events.create",
    "admin.read",
    "admin.write",
  ],
};

const readOnlyPermissions: Permission[] = [
  "dashboard.read",
  "hotel.read",
  "clients.read",
  "messages.read",
  "tasks.read",
  "instructions.read",
  "events.read",
];

function getLegacyPermissions(
  role: Role | LegacyRole
): Permission[] {
  switch (role) {
    case "owner":
    case "admin":
      return rolePermissions.admin;

    case "manager":
      return rolePermissions.manager;

    case "direction":
      return rolePermissions.direction;

    case "read_only":
      return readOnlyPermissions;

    case "employee":
    case "kitchen":
    case "reception":
    case "delivery":
    case "bedroom":
      return rolePermissions.employee;

    default:
      return [];
  }
}

export function can(
  role: Role | LegacyRole,
  permission: Permission
) {
  return getLegacyPermissions(role).includes(
    permission
  );
}