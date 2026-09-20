import type {
  DepartmentRelation,
  StaffMember,
  StaffRole,
} from "../types/users.types";

export const ROLE_LABELS: Record<
  StaffRole,
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

export const ROLE_DEPARTMENT_LABELS: Record<
  StaffRole,
  string
> = {
  owner: "Direction",
  admin: "Administration",
  manager: "Management",
  kitchen: "Cuisine",
  reception: "Réception",
  delivery: "Livraison",
  bedroom: "Hébergement",
  read_only: "Lecture seule",
};

export function getRoleLabel(
  role: StaffRole
) {
  return ROLE_LABELS[role] ?? role;
}

export function getFallbackDepartment(
  role: StaffRole
) {
  return (
    ROLE_DEPARTMENT_LABELS[role] ??
    "Équipe"
  );
}

export function getDepartmentName(
  relation: DepartmentRelation
) {
  if (!relation) {
    return "";
  }

  if (Array.isArray(relation)) {
    return (
      relation[0]?.name?.trim() ?? ""
    );
  }

  return relation.name?.trim() ?? "";
}

export function getDepartmentId(
  relation: DepartmentRelation
) {
  if (!relation) {
    return "";
  }

  if (Array.isArray(relation)) {
    return relation[0]?.id ?? "";
  }

  return relation.id ?? "";
}

export function getPrimaryDepartmentId(
  member: StaffMember
) {
  const assignments =
    member.staff_member_departments ??
    [];

  const primary =
    assignments.find(
      (item) =>
        item.is_primary === true
    ) ??
    assignments[0];

  if (!primary) {
    return "";
  }

  return getDepartmentId(
    primary.staff_departments ??
      null
  );
}

export function getMemberDepartments(
  member: StaffMember
) {
  const departments =
    member.staff_member_departments
      ?.map((item) =>
        getDepartmentName(
          item.staff_departments ??
            null
        )
      )
      .filter(Boolean) ?? [];

  if (departments.length > 0) {
    return departments.join(", ");
  }

  return getFallbackDepartment(
    member.role
  );
}

export function getMemberDisplayName(
  member: StaffMember
) {
  const displayName =
    member.display_name?.trim();

  if (displayName) {
    return displayName;
  }

  const email =
    member.email?.trim();

  if (email) {
    return email;
  }

  return "Utilisateur";
}

export function isInvitationExpired(
  expiresAt: string
) {
  return (
    new Date(expiresAt).getTime() <
    Date.now()
  );
}