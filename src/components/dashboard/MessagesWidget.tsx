import {
  MessageCircle,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import {
  useRecentMessagesWidget,
} from "../../features/widgets/messages/useRecentMessagesWidget";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function MessagesWidget({
  size,
}: DashboardWidgetComponentProps) {
  const {
    messages,
    loading,
    error,
  } =
    useRecentMessagesWidget();

  if (size === "small") {
    return (
      <Link
        to="/messages"
        className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small"
      >
        <div className="dashboard-widget-card__icon">
          <MessageCircle
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Messages récents
          </span>
          <strong>
            {loading
              ? "…"
              : messages.length}
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
            ÉQUIPE
          </span>
          <h2>
            Messages récents
          </h2>
        </div>

        <Link to="/messages">
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
      ) : messages.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucun message récent.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {messages
            .slice(0, limit)
            .map(
              (message) => (
                <div
                  className="dashboard-widget-feed"
                  key={
                    message.id
                  }
                >
                  <div>
                    <strong>
                      {
                        message.author_name
                      }
                    </strong>
                    <span>
                      #
                      {
                        message.channel_name
                      }
                    </span>
                    <p>
                      {
                        message.content
                      }
                    </p>
                  </div>

                  <small>
                    {formatTime(
                      message.created_at
                    )}
                  </small>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}
