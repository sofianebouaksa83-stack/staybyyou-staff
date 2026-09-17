import type {
  StaffEvent,
} from "../../services/eventsService";

type Props = {
  currentMonth: Date;
  events: StaffEvent[];
  onEventClick?: (
    event: StaffEvent
  ) => void;
};

const weekDays = [
  "Lun.",
  "Mar.",
  "Mer.",
  "Jeu.",
  "Ven.",
  "Sam.",
  "Dim.",
];

function getMonthGrid(
  currentMonth: Date
) {
  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  const mondayIndex =
    (firstDay.getDay() + 6) % 7;

  const start =
    new Date(
      year,
      month,
      1 - mondayIndex
    );

  const days: Date[] = [];

  for (
    let i = 0;
    i < 42;
    i++
  ) {
    const date =
      new Date(start);

    date.setDate(
      start.getDate() + i
    );

    days.push(date);
  }

  return {
    days,
    month,
    lastDay,
  };
}

function sameDay(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}

function eventsForDay(
  events: StaffEvent[],
  date: Date
) {
  return events.filter(
    (event) =>
      sameDay(
        new Date(
          event.starts_at
        ),
        date
      )
  );
}

function categoryLabel(
  category:
    StaffEvent["category"]
) {
  switch (category) {
    case "guest":
      return "Client";

    case "fnb":
      return "F&B";

    case "spa":
      return "Spa";

    case "maintenance":
      return "Maintenance";

    case "internal":
      return "Interne";

    default:
      return "Autre";
  }
}

export function EventsCalendar({
  currentMonth,
  events,
  onEventClick,
}: Props) {
  const {
    days,
    month,
  } =
    getMonthGrid(
      currentMonth
    );

  const today =
    new Date();

  return (
    <div className="events-calendar">
      <div className="events-calendar-weekdays">
        {weekDays.map(
          (day) => (
            <div key={day}>
              {day}
            </div>
          )
        )}
      </div>

      <div className="events-calendar-grid">
        {days.map(
          (date) => {
            const dayEvents =
              eventsForDay(
                events,
                date
              );

            const outsideMonth =
              date.getMonth() !==
              month;

            const isToday =
              sameDay(
                date,
                today
              );

            return (
              <div
                key={
                  date.toISOString()
                }
                className={`events-calendar-day ${
                  outsideMonth
                    ? "outside"
                    : ""
                }`}
              >
                <div className="events-calendar-day-number">
                  <span
                    className={
                      isToday
                        ? "today"
                        : ""
                    }
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="events-calendar-day-events">
                  {dayEvents
                    .slice(0, 4)
                    .map(
                      (event) => (
                        <button
                          key={
                            event.id
                          }
                          type="button"
                          className={`calendar-event calendar-event-${event.category}`}
                          onClick={() =>
                            onEventClick?.(
                              event
                            )
                          }
                        >
                          <span>
                            {
                              event.title
                            }
                          </span>

                          <small>
                            {categoryLabel(
                              event.category
                            )}
                          </small>
                        </button>
                      )
                    )}

                  {dayEvents.length >
                    4 && (
                    <span className="calendar-more">
                      +
                      {dayEvents.length -
                        4}{" "}
                      autres
                    </span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}