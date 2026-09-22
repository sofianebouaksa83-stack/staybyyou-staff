import {
  CalendarDays,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import {
  useEventsWidget,
} from "../../features/widgets/events/useEventsWidget";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

function formatEventTime(
  startsAt: string,
  allDay: boolean
) {
  if (allDay) {
    return "Journée";
  }

  return new Date(
    startsAt
  ).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function EventsWidget({
  size,
}: DashboardWidgetComponentProps) {
  const {
    events,
    loading,
    error,
  } =
    useEventsWidget();

  if (size === "small") {
    return (
      <Link
        to="/events"
        className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small"
      >
        <div className="dashboard-widget-card__icon">
          <CalendarDays
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Événements
          </span>
          <strong>
            {loading
              ? "…"
              : events.length}
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
            Événements
          </h2>
        </div>

        <Link to="/events">
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
      ) : events.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucun événement aujourd'hui.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {events
            .slice(0, limit)
            .map(
              (event) => (
                <div
                  className="dashboard-widget-feed"
                  key={
                    event.id
                  }
                >
                  <div>
                    <strong>
                      {
                        event.title
                      }
                    </strong>
                    {size ===
                      "large" &&
                      event.location && (
                        <p>
                          {
                            event.location
                          }
                        </p>
                      )}
                  </div>

                  <small>
                    {formatEventTime(
                      event.starts_at,
                      event.all_day
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
