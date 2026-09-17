import { supabase } from "./supabase";

export type StayStatus =
  | "arrival"
  | "in_house"
  | "departure";

export type GuestFollowupType =
  | "note"
  | "request"
  | "complaint"
  | "incident"
  | "preference"
  | "vip";

export type GuestFollowupStatus =
  | "open"
  | "in_progress"
  | "resolved";

export type GuestFollowupPriority =
  | "normal"
  | "high"
  | "urgent";

export type HotelStay = {
  id: string;
  hotel_id: string;
  room_id: string;

  guest_name: string;

  starts_at: string;
  ends_at: string;

  active: boolean;

  room: {
  id: string;
  name: string;
  code: string;
} | null;
};

export type GuestFollowup = {
  id: string;
  hotel_id: string;
  stay_id: string;

  followup_type: GuestFollowupType;
  status: GuestFollowupStatus;
  priority: GuestFollowupPriority;

  content: string;

  assigned_to: string | null;
  created_by: string | null;

  resolved_at: string | null;

  created_at: string;
  updated_at: string;
};

export async function getHotelStays(
  hotelId: string,
  startDate: string,
  endDate: string
) {
  const {
    data,
    error,
  } = await supabase
    .from("room_stays")
    .select(`
      id,
      hotel_id,
      room_id,
      guest_name,
      starts_at,
      ends_at,
      active,
      room:rooms (
        id,
        name,
        code
      )
    `)
    .eq("hotel_id", hotelId)
    .lt("starts_at", endDate)
    .gt("ends_at", startDate)
    .order(
      "starts_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  const normalized = (data ?? []).map(
    (stay) => {
      const rawRoom = stay.room;

      const room = Array.isArray(
        rawRoom
      )
        ? rawRoom[0] ?? null
        : rawRoom ?? null;

      return {
        ...stay,
        room,
      };
    }
  );

  return normalized as HotelStay[];
}

export async function getFollowups(
  hotelId: string,
  stayId: string
) {
  const { data, error } =
    await supabase
      .from("staff_guest_followups")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("stay_id", stayId)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    throw error;
  }

  return (data ?? []) as GuestFollowup[];
}

export async function createFollowup(values: {
  hotelId: string;
  stayId: string;

  type: GuestFollowupType;
  priority: GuestFollowupPriority;

  content: string;

  assignedTo?: string | null;
}) {
  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

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
      .from("staff_guest_followups")
      .insert({
        hotel_id:
          values.hotelId,

        stay_id:
          values.stayId,

        followup_type:
          values.type,

        status: "open",

        priority:
          values.priority,

        content:
          values.content.trim(),

        assigned_to:
          values.assignedTo ??
          null,

        created_by:
          authData.user.id,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as GuestFollowup;
}

export async function updateFollowup(
  id: string,
  updates: Partial<{
    followup_type:
      GuestFollowupType;

    status:
      GuestFollowupStatus;

    priority:
      GuestFollowupPriority;

    content: string;

    assigned_to:
      string | null;

    resolved_at:
      string | null;
  }>
) {
  const { data, error } =
    await supabase
      .from("staff_guest_followups")
      .update({
        ...updates,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as GuestFollowup;
}

export async function deleteFollowup(
  id: string
) {
  const { error } =
    await supabase
      .from("staff_guest_followups")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}