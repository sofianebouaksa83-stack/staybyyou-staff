export type PermissionRole =
  | "owner"
  | "admin"
  | "manager"
  | "kitchen"
  | "reception"
  | "delivery"
  | "bedroom"
  | "read_only";

export type RolePermission = {
  role: PermissionRole;
  permission_key: string;
  permission_label: string;
  category_key: string;
  category_label: string;
  description: string;
  allowed: boolean;
  sort_order: number;
};

export type RolePermissionsGroup = {
  role: PermissionRole;
  permissions: RolePermission[];
};