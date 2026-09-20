import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from "../services/notifications.service";

import type {
  StaffNotification,
} from "../types/notifications.types";

const NOTIFICATIONS_CHANGED_EVENT =
  "staybyyou:notifications-changed";

function broadcastNotificationChange() {
  window.dispatchEvent(
    new Event(
      NOTIFICATIONS_CHANGED_EVENT
    )
  );
}

export function useNotifications(
  hotelId: string | null,
  userId?: string
) {
  const [
    notifications,
    setNotifications,
  ] =
    useState<
      StaffNotification[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const refresh =
    useCallback(async () => {
      if (
        !hotelId ||
        !userId
      ) {
        setNotifications(
          []
        );

        setLoading(false);

        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getNotifications(
            hotelId,
            userId
          );

        setNotifications(
          data
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les notifications."
        );
      } finally {
        setLoading(false);
      }
    }, [
      hotelId,
      userId,
    ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleChange() {
      void refresh();
    }

    window.addEventListener(
      NOTIFICATIONS_CHANGED_EVENT,
      handleChange
    );

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        handleChange
      );
    };
  }, [refresh]);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.read_at
        ).length,
      [notifications]
    );

  const markRead =
    useCallback(
      async (
        notificationId: string
      ) => {
        if (!userId) {
          return;
        }

        await markNotificationRead(
          notificationId,
          userId
        );

        const now =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (
                notification
              ) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read_at: now,
                    }
                  : notification
            )
        );

        broadcastNotificationChange();
      },
      [userId]
    );

  const markUnread =
    useCallback(
      async (
        notificationId: string
      ) => {
        if (!userId) {
          return;
        }

        await markNotificationUnread(
          notificationId,
          userId
        );

        setNotifications(
          (current) =>
            current.map(
              (
                notification
              ) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read_at:
                        null,
                    }
                  : notification
            )
        );

        broadcastNotificationChange();
      },
      [userId]
    );

  const markAllRead =
    useCallback(
      async () => {
        if (!userId) {
          return;
        }

        await markAllNotificationsRead(
          notifications,
          userId
        );

        const now =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (
                notification
              ) => ({
                ...notification,
                read_at:
                  notification.read_at ??
                  now,
              })
            )
        );

        broadcastNotificationChange();
      },
      [
        notifications,
        userId,
      ]
    );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
  };
}