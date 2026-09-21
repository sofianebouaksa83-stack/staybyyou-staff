import { supabase } from "./supabase";

export type EventCategory =
  | "internal"
  | "guest"
  | "fnb"
  | "spa"
  | "maintenance"
  | "other";

export type EventDepartment = {
  id: string;
  hotel_id: string;
  name: string;
};

export type StaffEvent = {
  id: string;
  hotel_id: string;
  department_id: string | null;

  department: {
    id: string;
    name: string;
  } | null;

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

function normalizeEvent(
  event: any
): StaffEvent {
  const rawDepartment =
    event.department;

  const department =
    Array.isArray(
      rawDepartment
    )
      ? rawDepartment[0] ??
        null
      : rawDepartment ??
        null;

  return {
    ...event,
    department,
  } as StaffEvent;
}


/* =========================================================
   DEPARTMENTS
   ========================================================= */

export async function getEventDepartments(
  hotelId: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_departments"
      )
      .select(`
        id,
        hotel_id,
        name
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
        "sort_order",
        {
          ascending:
            true,
        }
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
  ) as EventDepartment[];
}


/* =========================================================
   EVENTS
   ========================================================= */

export async function getEvents(
  hotelId: string,
  startDate: string,
  endDate: string
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_events"
      )
      .select(`
        *,
        department:staff_departments (
          id,
          name
        )
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "active",
        true
      )

      // L'événement doit commencer
      // avant la fin du mois.
      .lt(
        "starts_at",
        endDate
      )

      // Et soit commencer dans le mois,
      // soit se terminer après son début.
      // Cela permet les événements
      // sur plusieurs jours/mois.
      .or(
        `starts_at.gte.${startDate},ends_at.gt.${startDate}`
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

  return (
    data ?? []
  ).map(
    normalizeEvent
  );
}


export async function createEvent(
  values: {
    hotelId: string;

    departmentId?:
      string | null;

    title: string;
    description?: string;
    location?: string;

    category:
      EventCategory;

    startsAt: string;

    endsAt?:
      string | null;

    allDay?:
      boolean;

    pinned?:
      boolean;
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
        "staff_events"
      )
      .insert({
        hotel_id:
          values.hotelId,

        department_id:
          values.departmentId ??
          null,

        title:
          values.title.trim(),

        description:
          values.description
            ?.trim() ||
          null,

        location:
          values.location
            ?.trim() ||
          null,

        category:
          values.category,

        starts_at:
          values.startsAt,

        ends_at:
          values.endsAt ??
          null,

        all_day:
          values.allDay ??
          false,

        pinned:
          values.pinned ??
          false,

        active:
          true,

        created_by:
          authData.user.id,
      })
      .select(`
        *,
        department:staff_departments (
          id,
          name
        )
      `)
      .single();

  if (error) {
    throw error;
  }

  return normalizeEvent(
    data
  );
}


export async function updateEvent(
  id: string,

  updates: Partial<{
    department_id:
      string | null;

    title: string;

    description:
      string | null;

    location:
      string | null;

    category:
      EventCategory;

    starts_at:
      string;

    ends_at:
      string | null;

    all_day:
      boolean;

    pinned:
      boolean;

    active:
      boolean;
  }>
) {
  const {
    data: authData,
  } =
    await supabase.auth.getUser();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "staff_events"
      )
      .update({
        ...updates,

        updated_by:
          authData.user?.id ??
          null,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        id
      )
      .select(`
        *,
        department:staff_departments (
          id,
          name
        )
      `)
      .single();

  if (error) {
    throw error;
  }

  return normalizeEvent(
    data
  );
}


export async function deleteEvent(
  id: string
) {
  const {
    error,
  } =
    await supabase
      .from(
        "staff_events"
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