import { supabase } from "./supabase";

export type StaffChannel = {
  id: string;
  hotel_id: string;
  name: string;
  channel_type: "team" | "private" | "direct";
  active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StaffMessage = {
  id: string;
  hotel_id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type StaffMessageWithAuthor = StaffMessage & {
  author_name: string;
  author_department: string | null;
};

export async function getChannels(
  hotelId: string
) {
  const { data, error } = await supabase
    .from("staff_channels")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as StaffChannel[];
}

export async function getMessages(
  hotelId: string,
  channelId: string
) {
  const { data, error } = await supabase
    .from("staff_messages")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("channel_id", channelId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  const messages =
    (data ?? []) as StaffMessage[];

  if (messages.length === 0) {
    return [];
  }

  const userIds = [
    ...new Set(
      messages.map(
        (message) =>
          message.user_id
      )
    ),
  ];

  const { data: members } =
    await supabase
      .from("hotel_members")
      .select(
        "user_id, display_name, role"
      )
      .eq("hotel_id", hotelId)
      .in("user_id", userIds);

  const memberMap =
    new Map<
      string,
      {
        display_name: string;
        role: string;
      }
    >();

  (members ?? []).forEach(
    (member) => {
      memberMap.set(
        member.user_id,
        {
          display_name:
            member.display_name,
          role:
            String(member.role),
        }
      );
    }
  );

  return messages.map(
    (message) => {
      const member =
        memberMap.get(
          message.user_id
        );

      return {
        ...message,
        author_name:
          member?.display_name ??
          "Membre",
        author_department:
          member?.role ?? null,
      };
    }
  ) as StaffMessageWithAuthor[];
}

export async function sendMessage({
  hotelId,
  channelId,
  content,
}: {
  hotelId: string;
  channelId: string;
  content: string;
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
      .from("staff_messages")
      .insert({
        hotel_id: hotelId,
        channel_id: channelId,
        user_id:
          authData.user.id,
        content:
          content.trim(),
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffMessage;
}

export function subscribeToMessages(
  channelId: string,
  onMessage: (message: StaffMessage) => void
) {
  const channel = supabase
    .channel(`staff-messages-${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "staff_messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        onMessage(
          payload.new as StaffMessage
        );
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}