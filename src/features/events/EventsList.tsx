import { EventCard } from "./EventCard";

import type {
  StaffEvent,
} from "../../services/eventsService";

type Props = {
  events: StaffEvent[];
  onEventClick?: (
    event: StaffEvent
  ) => void;
};

export function EventsList({
  events,
  onEventClick,
}: Props) {
  if (events.length === 0) {
    return (
      <div className="events-empty">
        Aucun événement ce mois-ci.
      </div>
    );
  }

  return (
    <div className="events-list">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onClick={() =>
            onEventClick?.(event)
          }
        />
      ))}
    </div>
  );
}