import { supabase } from "../../../../services/supabase";

import type {
  StaffDepartment,
} from "../types/services.types";

export async function getHotelDepartments(
  hotelId: string
): Promise<StaffDepartment[]> {
  const { data, error } = await supabase
    .from("staff_departments")
    .select(`
      id,
      hotel_id,
      name,
      slug,
      active,
      sort_order,
      created_at,
      updated_at
    `)
    .eq("hotel_id", hotelId)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Impossible de charger les services : ${error.message}`
    );
  }

  return (data ?? []) as StaffDepartment[];
}

export async function createDepartment(
  hotelId: string,
  name: string
): Promise<void> {
  const { error } = await supabase.rpc(
    "create_staff_department",
    {
      p_hotel_id: hotelId,
      p_name: name.trim(),
    }
  );

  if (error) {
    throw new Error(
      `Impossible de créer le service : ${error.message}`
    );
  }
}

export async function updateDepartment(
  hotelId: string,
  departmentId: string,
  name: string,
  active: boolean
): Promise<void> {
  const { error } = await supabase.rpc(
    "update_staff_department",
    {
      p_hotel_id: hotelId,
      p_department_id: departmentId,
      p_name: name.trim(),
      p_active: active,
    }
  );

  if (error) {
    throw new Error(
      `Impossible de modifier le service : ${error.message}`
    );
  }
}