import type {
  StaffNotification,
} from "../types/notifications.types";

import {
  NotificationItem,
} from "./NotificationItem";

type NotificationsListProps = {
  notifications:
    StaffNotification[];

  loading: boolean;

  onMarkRead: (
    id: string
  ) => Promise<void>;

  onMarkUnread: (
    id: string
  ) => Promise<void>;
};

export function NotificationsList({
  notifications,
  loading,
  onMarkRead,
  onMarkUnread,
}: NotificationsListProps) {
  if (loading) {
    return (
      <div className="notifications-state">
        Chargement…
      </div>
    );
  }

  if (
    notifications.length ===
    0
  ) {
    return (
      <div className="notifications-state">
        <h3>
          Aucune notification
        </h3>

        <p>
          Rien ne nécessite
          votre attention pour
          le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      {notifications.map(
        (notification) => (
          <NotificationItem
            key={
              notification.id
            }
            notification={
              notification
            }
            onMarkRead={
              onMarkRead
            }
            onMarkUnread={
              onMarkUnread
            }
          />
        )
      )}
    </div>
  );
}