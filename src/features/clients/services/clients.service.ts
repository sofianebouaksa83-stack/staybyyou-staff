import { supabase } from "../../../services/supabase";

import type {
  ClientFollowup,
  ClientStay,
} from "../types/clients.types";

type RoomRelation =
  | {
      id: string;
      name: string;
      code: string;
    }
  | Array<{
      id: string;
      name: string;
      code: string;
    }>
  | null;

type ClientStayRow = {
  id: string;
  room_id: string;
  guest_name: string;
  starts_at: string;
  ends_at: string;
  active: boolean;
  rooms: RoomRelation;
};

type ClientFollowupRow = {
  id: string;
  stay_id: string;
  followup_type: ClientFollowup["type"];
  status: ClientFollowup["status"];
  priority: ClientFollowup["priority"];
  content: string;
  created_at: string;
  resolved_at: string | null;
};

const FOLLOWUP_SELECT = `
  id,
  stay_id,
  followup_type,
  status,
  priority,
  content,
  created_at,
  resolved_at
`;

function getRoom(
  relation: RoomRelation
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function mapClientStay(
  row: ClientStayRow
): ClientStay {
  const room = getRoom(
    row.rooms
  );

  return {
    id: row.id,

    guestName:
      row.guest_name,

    roomId:
      row.room_id,

    roomName:
      room?.name ?? "Chambre",

    roomCode:
      room?.code ?? "",

    startsAt:
      row.starts_at,

    endsAt:
      row.ends_at,

    active:
      row.active,
  };
}

function mapClientFollowup(
  row: ClientFollowupRow
): ClientFollowup {
  return {
    id: row.id,

    stayId:
      row.stay_id,

    type:
      row.followup_type,

    status:
      row.status,

    priority:
      row.priority,

    content:
      row.content,

    createdAt:
      row.created_at,

    resolvedAt:
      row.resolved_at,
  };
}

export async function getClientStays(
  hotelId: string
): Promise<ClientStay[]> {
  const {
    data,
    error,
  } = await supabase
    .from("room_stays")
    .select(`
      id,
      room_id,
      guest_name,
      starts_at,
      ends_at,
      active,
      rooms (
        id,
        name,
        code
      )
    `)
    .eq(
      "hotel_id",
      hotelId
    )
    .order(
      "starts_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Impossible de charger les clients : ${error.message}`
    );
  }

  return (
    (data ?? []) as ClientStayRow[]
  ).map(
    mapClientStay
  );
}

export async function getClientStayById(
  hotelId: string,
  stayId: string
): Promise<ClientStay | null> {
  const {
    data,
    error,
  } = await supabase
    .from("room_stays")
    .select(`
      id,
      room_id,
      guest_name,
      starts_at,
      ends_at,
      active,
      rooms (
        id,
        name,
        code
      )
    `)
    .eq(
      "hotel_id",
      hotelId
    )
    .eq(
      "id",
      stayId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Impossible de charger le client : ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapClientStay(
    data as ClientStayRow
  );
}

export async function getClientFollowups(
  hotelId: string,
  stayId: string
): Promise<ClientFollowup[]> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "staff_guest_followups"
    )
    .select(
      FOLLOWUP_SELECT
    )
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
        ascending: false,
      }
    );

  if (error) {
    throw new Error(
      `Impossible de charger le suivi client : ${error.message}`
    );
  }

  return (
    (data ?? []) as ClientFollowupRow[]
  ).map(
    mapClientFollowup
  );
}

export async function createClientFollowup(
  input: {
    hotelId: string;
    stayId: string;
    createdBy: string;

    type:
      ClientFollowup["type"];

    priority:
      ClientFollowup["priority"];

    content: string;
  }
): Promise<ClientFollowup> {
  const content =
    input.content.trim();

  if (!content) {
    throw new Error(
      "Le contenu du suivi est obligatoire."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "staff_guest_followups"
    )
    .insert({
      hotel_id:
        input.hotelId,

      stay_id:
        input.stayId,

      followup_type:
        input.type,

      status:
        "open",

      priority:
        input.priority,

      content,

      created_by:
        input.createdBy,
    })
    .select(
      FOLLOWUP_SELECT
    )
    .single();

  if (error) {
    throw new Error(
      `Impossible d'ajouter le suivi : ${error.message}`
    );
  }

  return mapClientFollowup(
    data as ClientFollowupRow
  );
}

export async function updateClientFollowup(
  input: {
    hotelId: string;
    followupId: string;

    type:
      ClientFollowup["type"];

    priority:
      ClientFollowup["priority"];

    content: string;
  }
): Promise<ClientFollowup> {
  const content =
    input.content.trim();

  if (!content) {
    throw new Error(
      "Le contenu du suivi est obligatoire."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "staff_guest_followups"
    )
    .update({
      followup_type:
        input.type,

      priority:
        input.priority,

      content,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "hotel_id",
      input.hotelId
    )
    .eq(
      "id",
      input.followupId
    )
    .select(
      FOLLOWUP_SELECT
    )
    .single();

  if (error) {
    throw new Error(
      `Impossible de modifier le suivi : ${error.message}`
    );
  }

  return mapClientFollowup(
    data as ClientFollowupRow
  );
}

export async function updateClientFollowupStatus(
  input: {
    hotelId: string;

    followupId: string;

    status:
      ClientFollowup["status"];
  }
): Promise<ClientFollowup> {
  const resolvedAt =
    input.status === "resolved"
      ? new Date().toISOString()
      : null;

  const {
    data,
    error,
  } = await supabase
    .from(
      "staff_guest_followups"
    )
    .update({
      status:
        input.status,

      resolved_at:
        resolvedAt,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "hotel_id",
      input.hotelId
    )
    .eq(
      "id",
      input.followupId
    )
    .select(
      FOLLOWUP_SELECT
    )
    .single();

  if (error) {
    throw new Error(
      `Impossible de modifier le statut : ${error.message}`
    );
  }

  return mapClientFollowup(
    data as ClientFollowupRow
  );
}

export async function deleteClientFollowup(
  hotelId: string,
  followupId: string
) {
  const {
    error,
  } = await supabase
    .from(
      "staff_guest_followups"
    )
    .delete()
    .eq(
      "hotel_id",
      hotelId
    )
    .eq(
      "id",
      followupId
    );

  if (error) {
    throw new Error(
      `Impossible de supprimer le suivi : ${error.message}`
    );
  }
}