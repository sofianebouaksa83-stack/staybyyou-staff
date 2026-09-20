import {
  Check,
  CheckCheck,
  CircleAlert,
  Clock3,
  PackageCheck,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import type {
  StaffNotification,
} from "../types/notifications.types";

import {
  formatNotificationDate,
  getNotificationTypeLabel,
} from "../utils/notifications.utils";

type NotificationItemProps = {
  notification:
    StaffNotification;

  onMarkRead: (
    id: string
  ) => Promise<void>;

  onMarkUnread: (
    id: string
  ) => Promise<void>;
};

function NotificationIcon({
  type,
}: {
  type: string;
}) {
  switch (type) {
    case "order_new":
      return (
        <ShoppingBag
          size={18}
        />
      );

    case "order_ready":
      return (
        <PackageCheck
          size={18}
        />
      );

    case "order_cancelled":
      return (
        <XCircle
          size={18}
        />
      );

    default:
      return (
        <CircleAlert
          size={18}
        />
      );
  }
}

export function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
}: NotificationItemProps) {
  const unread =
    !notification.read_at;

  return (
    <article
      className={
        unread
          ? "notifications-item notifications-item--unread"
          : "notifications-item"
      }
    >
      <div className="notifications-item-icon">
        <NotificationIcon
          type={
            notification.type
          }
        />
      </div>

      <div className="notifications-item-content">
        <div className="notifications-item-top">
          <div>
            <span className="notifications-item-type">
              {getNotificationTypeLabel(
                notification.type
              )}
            </span>

            <h3>
              {
                notification.title
              }
            </h3>
          </div>

          {unread && (
            <span className="notifications-unread-dot" />
          )}
        </div>

        {notification.message && (
          <p>
            {
              notification.message
            }
          </p>
        )}

        <div className="notifications-item-bottom">
          <span className="notifications-item-date">
            <Clock3
              size={13}
            />

            {formatNotificationDate(
              notification.created_at
            )}
          </span>

          <button
            type="button"
            className="notifications-item-action"
            onClick={() =>
              void (
                unread
                  ? onMarkRead(
                      notification.id
                    )
                  : onMarkUnread(
                      notification.id
                    )
              )
            }
          >
            {unread ? (
              <>
                <Check
                  size={14}
                />
                Marquer comme lue
              </>
            ) : (
              <>
                <CheckCheck
                  size={14}
                />
                Marquer non lue
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}