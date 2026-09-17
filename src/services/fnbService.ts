import { supabase } from "./supabase";

export type FnbServiceRow = {
  id: string;
  hotel_id: string;
  name: string;
  default_start_time: string | null;
  default_end_time: string | null;
  default_capacity: number | null;
  active: boolean;
  sort_order: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type FnbDailyRow = {
  id: string;
  hotel_id: string;
  service_id: string;
  service_date: string;
  start_time: string | null;
  end_time: string | null;
  reservations: number;
  capacity: number | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * TEMPORAIRE :
 * on récupère le premier hôtel actif.
 *
 * Plus tard, quand l'auth Staff sera branchée,
 * on récupérera l'hôtel de l'utilisateur via hotel_members.
 */
export async function getCurrentHotelId() {
  const { data, error } = await supabase
    .from("hotels")
    .select("id")
    .eq("active", true)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

/**
 * Liste des services F&B configurés pour l'hôtel.
 */
export async function getFnbServices(
  hotelId: string
) {
  const { data, error } = await supabase
    .from("staff_fnb_services")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as FnbServiceRow[];
}

/**
 * Données F&B d'une journée précise.
 */
export async function getFnbDaily(
  hotelId: string,
  date: string
) {
  const { data, error } = await supabase
    .from("staff_fnb_daily")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("service_date", date);

  if (error) {
    throw error;
  }

  return (data ?? []) as FnbDailyRow[];
}

/**
 * Création / mise à jour des chiffres d'une journée.
 *
 * Nécessite une contrainte UNIQUE sur :
 * service_id + service_date
 */
export async function saveFnbDaily({
  hotelId,
  serviceId,
  date,
  startTime,
  endTime,
  reservations,
  capacity,
}: {
  hotelId: string;
  serviceId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reservations: number;
  capacity: number | null;
}) {
  const { data, error } = await supabase
    .from("staff_fnb_daily")
    .upsert(
      {
        hotel_id: hotelId,
        service_id: serviceId,
        service_date: date,
        start_time: startTime,
        end_time: endTime,
        reservations,
        capacity,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict:
          "service_id,service_date",
      }
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as FnbDailyRow;
}

/**
 * Modifie la configuration permanente d'un service.
 *
 * Exemple :
 * nom, horaires par défaut, capacité par défaut.
 */
export async function updateFnbService(
  serviceId: string,
  updates: {
    name?: string;
    default_start_time?: string | null;
    default_end_time?: string | null;
    default_capacity?: number | null;
    active?: boolean;
    sort_order?: number;
  }
) {
  const { data, error } = await supabase
    .from("staff_fnb_services")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as FnbServiceRow;
}

/**
 * Ajoute un nouveau service.
 */
export async function createFnbService({
  hotelId,
  name,
  startTime,
  endTime,
  capacity,
  sortOrder,
}: {
  hotelId: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  capacity: number | null;
  sortOrder: number;
}) {
  const { data, error } = await supabase
    .from("staff_fnb_services")
    .insert({
      hotel_id: hotelId,
      name,
      default_start_time: startTime,
      default_end_time: endTime,
      default_capacity: capacity,
      active: true,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as FnbServiceRow;
}

/**
 * On ne supprime pas réellement le service.
 * On le désactive pour conserver l'historique.
 */
export async function disableFnbService(
  serviceId: string
) {
  return updateFnbService(
    serviceId,
    {
      active: false,
    }
  );
}