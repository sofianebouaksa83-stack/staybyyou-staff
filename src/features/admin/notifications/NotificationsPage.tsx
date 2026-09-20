import {
  CheckCheck,
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  SettingsShell,
} from "../../../pages/SettingsShell";

import {
  NotificationsList,
} from "./components/NotificationsList";

import {
  useNotifications,
} from "./hooks/useNotifications";

export default function NotificationsPage() {
  const {
    hotelId,
    session,
  } = useApp();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markUnread,
    markAllRead,
  } = useNotifications(
    hotelId,
    session?.user.id
  );

  return (
    <SettingsShell
      sectionLabel="Personnel"
      sectionTitle="Notifications"
      sectionSubtitle="Uniquement ce qui mérite réellement votre attention."
    >
      <div className="notifications-toolbar">
        <div className="notifications-summary">
          <strong>
            {
              notifications.length
            }{" "}
            notification
            {notifications.length >
            1
              ? "s"
              : ""}
          </strong>

          <span>
            {unreadCount} non lue
            {unreadCount > 1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="notifications-toolbar-actions">
          <button
            type="button"
            className="notifications-refresh-button"
            onClick={() =>
              void refresh()
            }
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw
              size={16}
            />
          </button>

          <button
            type="button"
            className="notifications-primary-button"
            onClick={() =>
              void markAllRead()
            }
            disabled={
              loading ||
              unreadCount === 0
            }
          >
            <CheckCheck
              size={16}
            />
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {error && (
        <div
          className="notifications-feedback notifications-feedback--error"
          role="alert"
        >
          {error}
        </div>
      )}

      <NotificationsList
        notifications={
          notifications
        }
        loading={loading}
        onMarkRead={
          markRead
        }
        onMarkUnread={
          markUnread
        }
      />
    </SettingsShell>
  );
}