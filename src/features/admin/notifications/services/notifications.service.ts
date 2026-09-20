import { supabase } from "../../../../services/supabase";

import type {
  NotificationRead,
  StaffNotification,
} from "../types/notifications.types";

export async function getNotifications(
  hotelId: string,
  userId: string
): Promise<StaffNotification[]> {
  const [
    notificationsResult,
    readsResult,
  ] = await Promise.all([
    supabase
      .from("notifications")
      .select(`
        id,
        hotel_id,
        type,
        title,
        message,
        related_order_id,
        audience_permission,
        created_at
      `)
      .eq(
        "hotel_id",
        hotelId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(100),

    supabase
      .from(
        "notification_reads"
      )
      .select(`
        notification_id,
        user_id,
        read_at
      `)
      .eq(
        "user_id",
        userId
      ),
  ]);

  if (
    notificationsResult.error
  ) {
    throw new Error(
      `Impossible de charger les notifications : ${notificationsResult.error.message}`
    );
  }

  if (readsResult.error) {
    throw new Error(
      `Impossible de charger l'état des notifications : ${readsResult.error.message}`
    );
  }

  const reads =
    (readsResult.data ??
      []) as NotificationRead[];

  const readMap =
    new Map(
      reads.map(
        (read) => [
          read.notification_id,
          read.read_at,
        ]
      )
    );

  return (
    notificationsResult.data ??
    []
  ).map(
    (notification) => ({
      ...notification,

      read_at:
        readMap.get(
          notification.id
        ) ?? null,
    })
  ) as StaffNotification[];
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "notification_reads"
      )
      .upsert(
        {
          notification_id:
            notificationId,

          user_id:
            userId,

          read_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "notification_id,user_id",
        }
      );

  if (error) {
    throw new Error(
      `Impossible de marquer la notification comme lue : ${error.message}`
    );
  }
}

export async function markNotificationUnread(
  notificationId: string,
  userId: string
): Promise<void> {
  const { error } =
    await supabase
      .from(
        "notification_reads"
      )
      .delete()
      .eq(
        "notification_id",
        notificationId
      )
      .eq(
        "user_id",
        userId
      );

  if (error) {
    throw new Error(
      `Impossible de marquer la notification comme non lue : ${error.message}`
    );
  }
}

export async function markAllNotificationsRead(
  notifications:
    StaffNotification[],
  userId: string
): Promise<void> {
  const unread =
    notifications.filter(
      (notification) =>
        !notification.read_at
    );

  if (
    unread.length === 0
  ) {
    return;
  }

  const now =
    new Date().toISOString();

  const rows =
    unread.map(
      (notification) => ({
        notification_id:
          notification.id,

        user_id:
          userId,

        read_at: now,
      })
    );

  const { error } =
    await supabase
      .from(
        "notification_reads"
      )
      .upsert(
        rows,
        {
          onConflict:
            "notification_id,user_id",
        }
      );

  if (error) {
    throw new Error(
      `Impossible de marquer les notifications comme lues : ${error.message}`
    );
  }
}