import { supabase } from "./supabase";

export type EventCategory =
  | "internal"
  | "guest"
  | "fnb"
  | "spa"
  | "maintenance"
  | "other";

export type StaffEvent = {
  id: string;
  hotel_id: string;
  department_id: string | null;

  title: string;
  description: string | null;
  location: string | null;

  category: EventCategory;

  starts_at: string;
  ends_at: string | null;

  all_day: boolean;
  pinned: boolean;
  active: boolean;

  created_by: string | null;
  updated_by: string | null;

  created_at: string;
  updated_at: string;
};

export async function getEvents(
  hotelId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } =
    await supabase
      .from("staff_events")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("active", true)
      .gte("starts_at", startDate)
      .lt("starts_at", endDate)
      .order("starts_at", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as StaffEvent[];
}

export async function createEvent(values: {
  hotelId: string;
  departmentId?: string | null;

  title: string;
  description?: string;
  location?: string;

  category: EventCategory;

  startsAt: string;
  endsAt?: string | null;

  allDay?: boolean;
  pinned?: boolean;
}) {
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const { data, error } =
    await supabase
      .from("staff_events")
      .insert({
        hotel_id: values.hotelId,

        department_id:
          values.departmentId ?? null,

        title: values.title.trim(),

        description:
          values.description?.trim() ||
          null,

        location:
          values.location?.trim() ||
          null,

        category: values.category,

        starts_at: values.startsAt,

        ends_at:
          values.endsAt ?? null,

        all_day:
          values.allDay ?? false,

        pinned:
          values.pinned ?? false,

        active: true,

        created_by:
          authData.user.id,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffEvent;
}

export async function updateEvent(
  id: string,
  updates: Partial<{
    department_id: string | null;

    title: string;
    description: string | null;
    location: string | null;

    category: EventCategory;

    starts_at: string;
    ends_at: string | null;

    all_day: boolean;
    pinned: boolean;
    active: boolean;
  }>
) {
  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const { data, error } =
    await supabase
      .from("staff_events")
      .update({
        ...updates,

        updated_by:
          authData.user?.id ??
          null,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffEvent;
}

export async function deleteEvent(
  id: string
) {
  const { error } =
    await supabase
      .from("staff_events")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}