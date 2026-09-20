import type {
  PermissionRole,
  RolePermission,
  RolePermissionsGroup,
} from "../types/permissions.types";

export const ROLE_LABELS: Record<
  PermissionRole,
  string
> = {
  owner: "Propriétaire",
  admin: "Administrateur",
  manager: "Manager",
  kitchen: "Cuisine",
  reception: "Réception",
  delivery: "Livraison",
  bedroom: "Hébergement",
  read_only: "Lecture seule",
};

export const ROLE_DESCRIPTIONS: Record<
  PermissionRole,
  string
> = {
  owner:
    "Accès complet à l’établissement.",
  admin:
    "Administration complète de l’espace Staff.",
  manager:
    "Gestion opérationnelle avancée.",
  kitchen:
    "Accès aux commandes et au service cuisine.",
  reception:
    "Accès au tableau de bord, aux chambres et aux commandes.",
  delivery:
    "Accès au suivi et à la mise à jour des commandes.",
  bedroom:
    "Rôle hébergement sans permissions spécifiques pour le moment.",
  read_only:
    "Consultation sans actions sensibles.",
};

export function groupPermissionsByRole(
  permissions: RolePermission[]
): RolePermissionsGroup[] {
  const map = new Map<
    PermissionRole,
    RolePermission[]
  >();

  for (const permission of permissions) {
    const current =
      map.get(permission.role) ?? [];

    current.push(permission);

    map.set(
      permission.role,
      current
    );
  }

  return Array.from(
    map.entries()
  ).map(
    ([role, rolePermissions]) => ({
      role,
      permissions:
        rolePermissions.sort(
          (a, b) =>
            a.sort_order -
            b.sort_order
        ),
    })
  );
}

export function countAllowedPermissions(
  permissions: RolePermission[]
) {
  return permissions.filter(
    (permission) =>
      permission.allowed
  ).length;
}