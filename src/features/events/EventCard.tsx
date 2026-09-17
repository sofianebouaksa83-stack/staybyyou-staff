import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import type {
  StaffEvent,
} from "../../services/eventsService";

type Props = {
  event: StaffEvent;
  onClick?: () => void;
};

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(new Date(value));
}

function formatTime(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export function EventCard({
  event,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className="event-list-card"
      onClick={onClick}
    >
      <div className="event-list-date">
        <span>
          {formatDate(
            event.starts_at
          )}
        </span>
      </div>

      <div className="event-list-content">
        <h3>{event.title}</h3>

        {event.description && (
          <p>
            {event.description}
          </p>
        )}

        <div className="event-list-meta">
          <span>
            <CalendarDays
              size={13}
            />

            {event.all_day
              ? "Toute la journée"
              : formatTime(
                  event.starts_at
                )}
          </span>

          {event.location && (
            <span>
              <MapPin size={13} />
              {event.location}
            </span>
          )}

          {!event.all_day &&
            event.ends_at && (
              <span>
                <Clock3
                  size={13}
                />
                jusqu’à{" "}
                {formatTime(
                  event.ends_at
                )}
              </span>
            )}
        </div>
      </div>
    </button>
  );
}