import { supabase } from "../../../../services/supabase";

import type {
  StaffMember,
  StaffRole,
} from "../types/users.types";

export async function getHotelUsers(
  hotelId: string
): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from("hotel_members")
    .select(`
      id,
      user_id,
      hotel_id,
      display_name,
      email,
      role,
      active,
      created_at,
      staff_member_departments (
        is_primary,
        staff_departments (
          id,
          name
        )
      )
    `)
    .eq("hotel_id", hotelId)
    .order("display_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Impossible de charger les utilisateurs : ${error.message}`
    );
  }

  return (data ?? []) as unknown as StaffMember[];
}

export async function updateUserRole(
  hotelId: string,
  userId: string,
  role: StaffRole
): Promise<void> {
  const { error } = await supabase.rpc(
    "update_staff_role",
    {
      p_hotel_id: hotelId,
      p_user_id: userId,
      p_role: role,
    }
  );

  if (error) {
    throw new Error(
      `Impossible de modifier le rôle : ${error.message}`
    );
  }
}

export async function updateUserDepartment(
  hotelId: string,
  userId: string,
  departmentId: string
): Promise<void> {
  const { error } = await supabase.rpc(
    "set_staff_member_primary_department",
    {
      p_hotel_id: hotelId,
      p_user_id: userId,
      p_department_id:
        departmentId,
    }
  );

  if (error) {
    throw new Error(
      `Impossible de modifier le service : ${error.message}`
    );
  }
}

export async function removeHotelUser(
  hotelId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc(
    "remove_staff_member",
    {
      p_hotel_id: hotelId,
      p_user_id: userId,
    }
  );

  if (error) {
    throw new Error(
      `Impossible de retirer l'utilisateur : ${error.message}`
    );
  }
}