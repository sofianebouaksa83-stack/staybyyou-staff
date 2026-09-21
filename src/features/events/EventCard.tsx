import {
  CalendarDays,
  Clock3,
  MapPin,
  UsersRound,
} from "lucide-react";

import type {
  StaffEvent,
} from "../../services/eventsService";


type Props = {
  event:
    StaffEvent;

  onClick?:
    () => void;
};


function formatDate(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "2-digit",

      month:
        "short",
    }
  ).format(
    new Date(
      value
    )
  );
}


function formatTime(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}


function endDisplayDate(
  event:
    StaffEvent
) {
  if (
    !event.ends_at
  ) {
    return null;
  }


  const end =
    new Date(
      event.ends_at
    );


  if (
    event.all_day
  ) {
    end.setMilliseconds(
      end.getMilliseconds() -
        1
    );
  }


  return end;
}


function sameDay(
  a:
    Date,

  b:
    Date
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


export function EventCard({
  event,
  onClick,
}: Props) {
  const start =
    new Date(
      event.starts_at
    );


  const end =
    endDisplayDate(
      event
    );


  const multipleDays =
    Boolean(
      end &&
      !sameDay(
        start,
        end
      )
    );


  return (
    <button
      type="button"
      className="event-list-card"

      onClick={
        onClick
      }
    >
      <div className="event-list-date">
        <span>
          {formatDate(
            event.starts_at
          )}

          {multipleDays &&
            end && (
              <>
                {" → "}

                {new Intl.DateTimeFormat(
                  "fr-FR",
                  {
                    day:
                      "2-digit",

                    month:
                      "short",
                  }
                ).format(
                  end
                )}
              </>
            )}
        </span>
      </div>


      <div className="event-list-content">
        <h3>
          {
            event.title
          }
        </h3>


        {event.description && (
          <p>
            {
              event.description
            }
          </p>
        )}


        <div className="event-list-meta">
          <span>
            <CalendarDays
              size={13}
            />

            {event.all_day
              ? multipleDays
                ? "Plusieurs jours"
                : "Toute la journée"
              : formatTime(
                  event.starts_at
                )}
          </span>


          {event.location && (
            <span>
              <MapPin
                size={13}
              />

              {
                event.location
              }
            </span>
          )}


          {event.department && (
            <span>
              <UsersRound
                size={13}
              />

              {
                event.department.name
              }
            </span>
          )}


          {!event.all_day &&
            event.ends_at && (
              <span>
                <Clock3
                  size={13}
                />

                jusqu’à{" "}

                {multipleDays
                  ? `${formatDate(
                      event.ends_at
                    )} ${formatTime(
                      event.ends_at
                    )}`
                  : formatTime(
                      event.ends_at
                    )}
              </span>
            )}
        </div>
      </div>
    </button>
  );
}