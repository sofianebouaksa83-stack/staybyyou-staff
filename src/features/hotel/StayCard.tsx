import {
  BedDouble,
  CalendarDays,
} from "lucide-react";

import type {
  HotelStay,
} from "../../services/hotelService";

type Props = {
  stay: HotelStay;
  onClick: () => void;
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
  ).format(
    new Date(value)
  );
}

export function StayCard({
  stay,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className="stay-card"
      onClick={onClick}
    >
      <div className="stay-card-main">
        <div>
          <h3>
            {stay.guest_name}
          </h3>

          <span className="stay-room">
            <BedDouble size={13} />

            {stay.room?.name ??
                 "Chambre inconnue"}
          </span>
        </div>

        <div className="stay-dates">
          <CalendarDays
            size={13}
          />

          <span>
            {formatDate(
              stay.starts_at
            )}
            {" → "}
            {formatDate(
              stay.ends_at
            )}
          </span>
        </div>
      </div>
    </button>
  );
}