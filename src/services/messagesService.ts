import { supabase } from "./supabase";

/* =========================================================
   TYPES
   ========================================================= */

export type ChannelType =
  | "team"
  | "private"
  | "direct"
  | "general"
  | "department"
  | "group";

export type ChannelVisibility =
  | "hotel"
  | "departments"
  | "members";

export type StaffChannel = {
  id: string;
  hotel_id: string;
  name: string;
  channel_type: ChannelType;
  visibility_mode: ChannelVisibility;

  description: string | null;

  active: boolean;
  sort_order: number;

  created_by: string | null;

  archived_at: string | null;

  is_system: boolean;

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

export type StaffMessageWithAuthor =
  StaffMessage & {
    author_name: string;
    author_department: string | null;
  };

export type MessageHotelMember = {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  active: boolean;
};

export type MessageDepartment = {
  id: string;
  hotel_id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
};

export type ChannelAccess = {
  memberUserIds: string[];
  departmentIds: string[];
};

export type CreateChannelInput = {
  hotelId: string;
  name: string;
  description?: string | null;

  channelType:
    | "team"
    | "group";

  visibilityMode: ChannelVisibility;

  memberUserIds?: string[];
  departmentIds?: string[];
};

export type UpdateChannelInput = {
  channelId: string;

  name: string;
  description?: string | null;

  visibilityMode: ChannelVisibility;

  memberUserIds?: string[];
  departmentIds?: string[];
};

/* =========================================================
   CHANNELS
   ========================================================= */

export async function getChannels(
  hotelId: string
) {
  const { data, error } =
    await supabase
      .from("staff_channels")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("active", true)
      .is("archived_at", null)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as StaffChannel[];
}

/* =========================================================
   HOTEL MEMBERS
   ========================================================= */

export async function getMessageHotelMembers(
  hotelId: string
) {
  const { data, error } =
    await supabase
      .from("hotel_members")
      .select(
        `
          id,
          user_id,
          display_name,
          email,
          role,
          active
        `
      )
      .eq("hotel_id", hotelId)
      .eq("active", true)
      .order("display_name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as MessageHotelMember[];
}

/* =========================================================
   DEPARTMENTS
   ========================================================= */

export async function getMessageDepartments(
  hotelId: string
) {
  const { data, error } =
    await supabase
      .from("staff_departments")
      .select(
        `
          id,
          hotel_id,
          name,
          slug,
          active,
          sort_order
        `
      )
      .eq("hotel_id", hotelId)
      .eq("active", true)
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as MessageDepartment[];
}

/* =========================================================
   CHANNEL ACCESS
   ========================================================= */

export async function getChannelAccess(
  channelId: string
): Promise<ChannelAccess> {
  const [
    membersResult,
    departmentsResult,
  ] = await Promise.all([
    supabase
      .from("staff_channel_members")
      .select("user_id")
      .eq("channel_id", channelId),

    supabase
      .from(
        "staff_channel_departments"
      )
      .select("department_id")
      .eq("channel_id", channelId),
  ]);

  if (membersResult.error) {
    throw membersResult.error;
  }

  if (departmentsResult.error) {
    throw departmentsResult.error;
  }

  return {
    memberUserIds: (
      membersResult.data ?? []
    ).map(
      (row) => row.user_id
    ),

    departmentIds: (
      departmentsResult.data ?? []
    ).map(
      (row) => row.department_id
    ),
  };
}

/* =========================================================
   CREATE CHANNEL
   ========================================================= */

export async function createChannel({
  hotelId,
  name,
  description = null,
  channelType,
  visibilityMode,
  memberUserIds = [],
  departmentIds = [],
}: CreateChannelInput) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    throw new Error(
      "Le nom du salon est obligatoire."
    );
  }

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

  const {
    error: channelError,
  } =
    await supabase
      .from("staff_channels")
      .insert({
        hotel_id:
          hotelId,

        name:
          cleanName,

        description:
          description?.trim() ||
          null,

        channel_type:
          channelType,

        visibility_mode:
          visibilityMode,

        active:
          true,

        is_system:
          false,

        created_by:
          authData.user.id,
      });

  if (channelError) {
    console.error(
      "Supabase create channel error:",
      channelError
    );

    if (
      channelError.code ===
      "23505"
    ) {
      throw new Error(
        "Un salon porte déjà ce nom."
      );
    }

    throw new Error(
      channelError.message ||
        "Impossible de créer le salon."
    );
  }

  const {
    data: channel,
    error: readError,
  } =
    await supabase
      .from("staff_channels")
      .select("*")
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "name",
        cleanName
      )
      .single();

  if (readError) {
    throw new Error(
      readError.message ||
        "Le salon a été créé mais ne peut pas être chargé."
    );
  }

  try {
    if (
      visibilityMode ===
        "members" &&
      memberUserIds.length >
        0
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            "staff_channel_members"
          )
          .insert(
            [
              ...new Set(
                memberUserIds
              ),
            ].map(
              (
                userId
              ) => ({
                channel_id:
                  channel.id,

                user_id:
                  userId,
              })
            )
          );

      if (error) {
        throw error;
      }
    }

    if (
      visibilityMode ===
        "departments" &&
      departmentIds.length >
        0
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            "staff_channel_departments"
          )
          .insert(
            [
              ...new Set(
                departmentIds
              ),
            ].map(
              (
                departmentId
              ) => ({
                channel_id:
                  channel.id,

                department_id:
                  departmentId,
              })
            )
          );

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    await supabase
      .from("staff_channels")
      .delete()
      .eq(
        "id",
        channel.id
      );

    throw error;
  }

  return channel as StaffChannel;
}

/* =========================================================
   UPDATE CHANNEL
   ========================================================= */

export async function updateChannel({
  channelId,
  name,
  description = null,
  visibilityMode,
  memberUserIds = [],
  departmentIds = [],
}: UpdateChannelInput) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    throw new Error(
      "Le nom du salon est obligatoire."
    );
  }

  const {
    data: channel,
    error: channelError,
  } =
    await supabase
      .from("staff_channels")
      .update({
        name: cleanName,

        description:
          description?.trim() ||
          null,

        visibility_mode:
          visibilityMode,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", channelId)
      .select()
      .single();

  if (channelError) {
    throw channelError;
  }

  const [
    deleteMembers,
    deleteDepartments,
  ] = await Promise.all([
    supabase
      .from(
        "staff_channel_members"
      )
      .delete()
      .eq(
        "channel_id",
        channelId
      ),

    supabase
      .from(
        "staff_channel_departments"
      )
      .delete()
      .eq(
        "channel_id",
        channelId
      ),
  ]);

  if (deleteMembers.error) {
    throw deleteMembers.error;
  }

  if (
    deleteDepartments.error
  ) {
    throw deleteDepartments.error;
  }

  if (
    visibilityMode ===
      "members" &&
    memberUserIds.length > 0
  ) {
    const { error } =
      await supabase
        .from(
          "staff_channel_members"
        )
        .insert(
          [
            ...new Set(
              memberUserIds
            ),
          ].map(
            (userId) => ({
              channel_id:
                channelId,

              user_id:
                userId,
            })
          )
        );

    if (error) {
      throw error;
    }
  }

  if (
    visibilityMode ===
      "departments" &&
    departmentIds.length > 0
  ) {
    const { error } =
      await supabase
        .from(
          "staff_channel_departments"
        )
        .insert(
          [
            ...new Set(
              departmentIds
            ),
          ].map(
            (
              departmentId
            ) => ({
              channel_id:
                channelId,

              department_id:
                departmentId,
            })
          )
        );

    if (error) {
      throw error;
    }
  }

  return channel as StaffChannel;
}

/* =========================================================
   ARCHIVE CHANNEL
   ========================================================= */

export async function archiveChannel(
  channelId: string
) {
  const { error } =
    await supabase
      .from("staff_channels")
      .update({
        active: false,

        archived_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", channelId);

  if (error) {
    throw error;
  }
}

/* =========================================================
   DELETE CHANNEL
   ========================================================= */

export async function deleteChannel(
  channelId: string
) {
  const { error } =
    await supabase
      .from("staff_channels")
      .delete()
      .eq("id", channelId);

  if (error) {
    throw error;
  }
}

/* =========================================================
   MESSAGES
   ========================================================= */

export async function getMessages(
  hotelId: string,
  channelId: string
) {
  const { data, error } =
    await supabase
      .from("staff_messages")
      .select("*")
      .eq(
        "hotel_id",
        hotelId
      )
      .eq(
        "channel_id",
        channelId
      )
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  const messages =
    (data ?? []) as StaffMessage[];

  if (
    messages.length === 0
  ) {
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
        `
          user_id,
          display_name,
          role
        `
      )
      .eq(
        "hotel_id",
        hotelId
      )
      .in(
        "user_id",
        userIds
      );

  const memberMap =
    new Map<
      string,
      {
        display_name: string;
        role: string;
      }
    >();

  (
    members ?? []
  ).forEach(
    (member) => {
      memberMap.set(
        member.user_id,
        {
          display_name:
            member.display_name,

          role:
            String(
              member.role
            ),
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
          member?.role ??
          null,
      };
    }
  ) as StaffMessageWithAuthor[];
}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

export async function sendMessage({
  hotelId,
  channelId,
  content,
}: {
  hotelId: string;
  channelId: string;
  content: string;
}) {
  const cleanContent =
    content.trim();

  if (!cleanContent) {
    throw new Error(
      "Le message est vide."
    );
  }

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
        hotel_id:
          hotelId,

        channel_id:
          channelId,

        user_id:
          authData.user.id,

        content:
          cleanContent,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffMessage;
}

/* =========================================================
   REALTIME
   ========================================================= */

export function subscribeToMessages(
  channelId: string,
  onMessage: (
    message: StaffMessage
  ) => void
) {
  const channel =
    supabase
      .channel(
        `staff-messages-${channelId}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table:
            "staff_messages",

          filter:
            `channel_id=eq.${channelId}`,
        },
        (payload) => {
          onMessage(
            payload.new as
              StaffMessage
          );
        }
      )
      .subscribe();

  return () => {
    void supabase.removeChannel(
      channel
    );
  };
}