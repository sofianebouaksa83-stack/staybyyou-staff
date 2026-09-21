import { supabase } from "../../../../services/supabase";

import type {
  PermissionRole,
  RolePermission,
} from "../types/permissions.types";


export async function getRolePermissions(
  hotelId: string
): Promise<RolePermission[]> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_staff_role_permissions",
      {
        p_hotel_id:
          hotelId,
      }
    );


  if (error) {
    throw new Error(
      `Impossible de charger les permissions : ${error.message}`
    );
  }


  return (
    data ?? []
  ) as RolePermission[];
}


export async function setRolePermissions(
  hotelId: string,
  role: PermissionRole,
  permissions: string[]
): Promise<void> {
  const {
    error,
  } =
    await supabase.rpc(
      "set_staff_role_permissions",
      {
        p_hotel_id:
          hotelId,

        p_role:
          role,

        p_permissions:
          permissions,
      }
    );


  if (error) {
    throw new Error(
      `Impossible de modifier les permissions : ${error.message}`
    );
  }
}


export async function resetRolePermissions(
  hotelId: string,
  role: PermissionRole
): Promise<void> {
  const {
    error,
  } =
    await supabase.rpc(
      "reset_staff_role_permissions",
      {
        p_hotel_id:
          hotelId,

        p_role:
          role,
      }
    );


  if (error) {
    throw new Error(
      `Impossible de réinitialiser les permissions : ${error.message}`
    );
  }
}