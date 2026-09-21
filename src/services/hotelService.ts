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

export type HotelRoom = {
  id: string;
  hotel_id: string;
  name: string;
  code: string;
  active: boolean;

  source: string;
  external_room_id:
    string | null;
};

export type HotelStay = {
  id: string;
  hotel_id: string;
  room_id: string;

  guest_name: string;

  starts_at: string;
  ends_at: string;

  active: boolean;

  source: string;

  external_reservation_id:
    string | null;

  external_guest_id:
    string | null;

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

  followup_type:
    GuestFollowupType;

  status:
    GuestFollowupStatus;

  priority:
    GuestFollowupPriority;

  content: string;

  assigned_to:
    string | null;

  created_by:
    string | null;

  resolved_at:
    string | null;

  created_at: string;
  updated_at: string;
};


/* =========================================================
   ROOMS
   ========================================================= */

export async function getHotelRooms(
  hotelId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("rooms")
      .select(`
        id,
        hotel_id,
        name,
        code,
        active,
        source,
        external_room_id
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "active",
        true
      )
      .order(
        "name",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as HotelRoom[];
}


/* =========================================================
   STAYS
   ========================================================= */

export async function getHotelStays(
  hotelId: string,
  startDate: string,
  endDate: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from("room_stays")
      .select(`
        id,
        hotel_id,
        room_id,
        guest_name,
        starts_at,
        ends_at,
        active,
        source,
        external_reservation_id,
        external_guest_id,
        room:rooms (
          id,
          name,
          code
        )
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .lt(
        "starts_at",
        endDate
      )
      .gt(
        "ends_at",
        startDate
      )
      .order(
        "starts_at",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw error;
  }

  const normalized =
    (data ?? []).map(
      (
        stay
      ) => {
        const rawRoom =
          stay.room;

        const room =
          Array.isArray(
            rawRoom
          )
            ? rawRoom[0] ??
              null
            : rawRoom ??
              null;

        return {
          ...stay,
          room,
        };
      }
    );

  return normalized as
    HotelStay[];
}


export async function createHotelStay({
  roomId,
  guestName,
  accessCode,
  startsAt,
  endsAt,
}: {
  roomId: string;
  guestName: string;
  accessCode: string;
  startsAt: string;
  endsAt: string;
}) {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "start_room_stay",
      {
        p_room_id:
          roomId,

        p_guest_name:
          guestName.trim(),

        p_access_code:
          accessCode,

        p_starts_at:
          startsAt,

        p_ends_at:
          endsAt,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data?.[0] ??
    null;
}


export async function updateHotelStay({
  stayId,
  roomId,
  guestName,
  startsAt,
  endsAt,
  accessCode,
}: {
  stayId: string;
  roomId: string;
  guestName: string;
  startsAt: string;
  endsAt: string;
  accessCode?:
    string | null;
}) {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_room_stay",
      {
        p_stay_id:
          stayId,

        p_room_id:
          roomId,

        p_guest_name:
          guestName.trim(),

        p_starts_at:
          startsAt,

        p_ends_at:
          endsAt,

        p_access_code:
          accessCode?.trim() ||
          null,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data === true;
}


export async function endHotelStay(
  stayId: string
) {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "end_room_stay",
      {
        p_stay_id:
          stayId,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data === true;
}


/* =========================================================
   FOLLOWUPS
   ========================================================= */

export async function getFollowups(
  hotelId: string,
  stayId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_guest_followups"
      )
      .select("*")
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "stay_id",
        stayId
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as GuestFollowup[];
}


export async function createFollowup(
  values: {
    hotelId: string;
    stayId: string;

    type:
      GuestFollowupType;

    priority:
      GuestFollowupPriority;

    content: string;

    assignedTo?:
      string | null;
  }
) {
  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (
    !authData.user
  ) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_guest_followups"
      )
      .insert({
        hotel_id:
          values.hotelId,

        stay_id:
          values.stayId,

        followup_type:
          values.type,

        status:
          "open",

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

  return data as
    GuestFollowup;
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
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_guest_followups"
      )
      .update({
        ...updates,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        id
      )
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as
    GuestFollowup;
}


export async function deleteFollowup(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "staff_guest_followups"
      )
      .delete()
      .eq(
        "id",
        id
      );

  if (error) {
    throw error;
  }
}