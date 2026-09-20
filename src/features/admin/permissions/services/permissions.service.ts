import { supabase } from "../../../../services/supabase";

import type {
  RolePermission,
} from "../types/permissions.types";

export async function getRolePermissions(
  hotelId: string
): Promise<RolePermission[]> {
  const { data, error } = await supabase.rpc(
    "get_staff_role_permissions",
    {
      p_hotel_id: hotelId,
    }
  );

  if (error) {
    throw new Error(
      `Impossible de charger les permissions : ${error.message}`
    );
  }

  return (data ?? []) as RolePermission[];
}