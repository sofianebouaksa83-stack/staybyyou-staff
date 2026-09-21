import { supabase } from "../../../services/supabase";

export type SearchClientResult = {
  id: string;
  guestName: string;
  roomName: string;
  roomCode: string;
};

export type SearchTaskResult = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  roomName: string | null;
};

export type SearchMessageResult = {
  id: string;
  content: string;
  channelId: string;
  channelName: string;
  createdAt: string;
};

export type GlobalSearchResults = {
  clients: SearchClientResult[];
  tasks: SearchTaskResult[];
  messages: SearchMessageResult[];
};

type RoomRelation =
  | {
      id?: string;
      name?: string;
      code?: string;
    }
  | Array<{
      id?: string;
      name?: string;
      code?: string;
    }>
  | null;

type ChannelRelation =
  | {
      name?: string;
    }
  | Array<{
      name?: string;
    }>
  | null;

function firstRelation<T>(
  relation: T | T[] | null
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function cleanQuery(
  query: string
) {
  return query
    .trim()
    .replace(/[(),.%_]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

export async function searchHotel(
  hotelId: string,
  rawQuery: string
): Promise<GlobalSearchResults> {
  const query =
    cleanQuery(rawQuery);

  if (
    !hotelId ||
    query.length < 2
  ) {
    return {
      clients: [],
      tasks: [],
      messages: [],
    };
  }

  const pattern =
    `%${query}%`;

  const [
    guestResult,
    roomResult,
    taskResult,
    messageResult,
  ] = await Promise.all([
    supabase
      .from("room_stays")
      .select(`
        id,
        guest_name,
        room_id,
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
      .ilike(
        "guest_name",
        pattern
      )
      .order(
        "starts_at",
        {
          ascending: false,
        }
      )
      .limit(20),

    supabase
      .from("rooms")
      .select(`
        id,
        name,
        code
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .or(
        `name.ilike.${pattern},code.ilike.${pattern}`
      )
      .limit(20),

    supabase
      .from("staff_tasks")
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_at,
        rooms (
          name,
          code
        )
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .or(
        `title.ilike.${pattern},description.ilike.${pattern}`
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(20),

    supabase
      .from("staff_messages")
      .select(`
        id,
        channel_id,
        content,
        created_at,
        staff_channels (
          name
        )
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .ilike(
        "content",
        pattern
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(20),
  ]);

  if (guestResult.error) {
    throw guestResult.error;
  }

  if (roomResult.error) {
    throw roomResult.error;
  }

  if (taskResult.error) {
    throw taskResult.error;
  }

  if (messageResult.error) {
    throw messageResult.error;
  }

  const matchingRoomIds =
    (roomResult.data ?? [])
      .map(
        (room) =>
          room.id
      )
      .filter(Boolean);

  let roomStayRows: any[] = [];

  if (
    matchingRoomIds.length
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("room_stays")
      .select(`
        id,
        guest_name,
        room_id,
        starts_at,
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
      .in(
        "room_id",
        matchingRoomIds
      )
      .order(
        "starts_at",
        {
          ascending: false,
        }
      )
      .limit(20);

    if (error) {
      throw error;
    }

    roomStayRows =
      data ?? [];
  }

  const clientMap =
    new Map<
      string,
      SearchClientResult
    >();

  [
    ...(guestResult.data ?? []),
    ...roomStayRows,
  ].forEach((row) => {
    const room =
      firstRelation(
        row.rooms as RoomRelation
      );

    clientMap.set(
      row.id,
      {
        id:
          row.id,

        guestName:
          row.guest_name,

        roomName:
          room?.name ??
          "Chambre",

        roomCode:
          room?.code ??
          "",
      }
    );
  });

  const clients =
    Array.from(
      clientMap.values()
    ).slice(
      0,
      20
    );

  const tasks: SearchTaskResult[] =
    (taskResult.data ?? []).map(
      (row) => {
        const room =
          firstRelation(
            row.rooms as RoomRelation
          );

        return {
          id:
            row.id,

          title:
            row.title,

          description:
            row.description,

          status:
            row.status,

          priority:
            row.priority,

          roomName:
            room?.code ??
            room?.name ??
            null,
        };
      }
    );

  const messages: SearchMessageResult[] =
    (messageResult.data ?? []).map(
      (row) => {
        const channel =
          firstRelation(
            row.staff_channels as ChannelRelation
          );

        return {
          id:
            row.id,

          content:
            row.content,

          channelId:
            row.channel_id,

          channelName:
            channel?.name ??
            "Messages",

          createdAt:
            row.created_at,
        };
      }
    );

  return {
    clients,
    tasks,
    messages,
  };
}