import {
  Bell,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import {
  useNotificationsWidget,
} from "../../features/widgets/notifications/useNotificationsWidget";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function NotificationsWidget({
  size,
}: DashboardWidgetComponentProps) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
  } =
    useNotificationsWidget();

  if (size === "small") {
    return (
      <Link
        to="/notifications"
        className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small"
      >
        <div className="dashboard-widget-card__icon">
          <Bell size={18} />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Notifications
          </span>
          <strong>
            {loading
              ? "…"
              : unreadCount}
          </strong>
        </div>
      </Link>
    );
  }

  const limit =
    size === "large"
      ? 5
      : 3;

  return (
    <section className={`dashboard-widget-card dashboard-widget-card--list dashboard-widget-card--${size}`}>
      <div className="dashboard-widget-card__header">
        <div>
          <span className="dashboard-widget-card__eyebrow">
            AUTRES
          </span>
          <h2>
            Notifications
          </h2>
        </div>

        <Link to="/notifications">
          Tout voir
        </Link>
      </div>

      {error ? (
        <p className="dashboard-widget-card__error">
          {error}
        </p>
      ) : loading ? (
        <p className="dashboard-widget-card__empty">
          Chargement…
        </p>
      ) : notifications.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucune notification.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {notifications
            .slice(0, limit)
            .map(
              (
                notification
              ) => (
                <div
                  className={`dashboard-widget-feed ${
                    notification.read_at
                      ? ""
                      : "dashboard-widget-feed--unread"
                  }`}
                  key={
                    notification.id
                  }
                >
                  <div>
                    <strong>
                      {
                        notification.title
                      }
                    </strong>
                    {size ===
                      "large" && (
                      <p>
                        {
                          notification.message
                        }
                      </p>
                    )}
                  </div>

                  {!notification.read_at && (
                    <i className="dashboard-widget-unread-dot" />
                  )}
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}
