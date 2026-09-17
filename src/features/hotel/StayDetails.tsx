import {
  BedDouble,
  CalendarDays,
  Plus,
  X,
} from "lucide-react";

import type {
  GuestFollowup,
  HotelStay,
} from "../../services/hotelService";

import { FollowupCard } from "./FollowupCard";

type Props = {
  stay: HotelStay | null;
  followups: GuestFollowup[];
  loadingFollowups: boolean;

  onClose: () => void;
  onAddFollowup: () => void;

  onUpdateFollowup: (
    followup: GuestFollowup
  ) => void;

  onDeleteFollowup: (
    id: string
  ) => void;
};

function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "medium",
    }
  ).format(
    new Date(value)
  );
}

export function StayDetails({
  stay,
  followups,
  loadingFollowups,
  onClose,
  onAddFollowup,
  onUpdateFollowup,
  onDeleteFollowup,
}: Props) {
  if (!stay) {
    return null;
  }

  return (
    <div
      className="stay-detail-backdrop"
      onClick={onClose}
    >
      <aside
        className="stay-detail-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="stay-detail-header">
          <div>
            <span className="eyebrow">
              SÉJOUR CLIENT
            </span>

            <h2>
              {stay.guest_name}
            </h2>
          </div>

          <button
            type="button"
            className="stay-detail-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="stay-detail-info">
          <span>
            <BedDouble size={14} />

            {stay.room?.name ??
                "Chambre inconnue"}
          </span>

          <span>
            <CalendarDays size={14} />

            {formatDate(
              stay.starts_at
            )}
            {" → "}
            {formatDate(
              stay.ends_at
            )}
          </span>
        </div>

        <div className="stay-followups-header">
          <div>
            <span className="eyebrow">
              SUIVI CLIENT
            </span>

            <h3>
              Historique
            </h3>
          </div>

          <button
            type="button"
            className="primary-button small-button"
            onClick={onAddFollowup}
          >
            <Plus size={14} />
            Ajouter
          </button>
        </div>

        {loadingFollowups ? (
          <div className="stay-followups-empty">
            Chargement du suivi…
          </div>
        ) : followups.length === 0 ? (
          <div className="stay-followups-empty">
            Aucun suivi pour ce client.
          </div>
        ) : (
          <div className="stay-followups-list">
            {followups.map(
              (followup) => (
                <FollowupCard
                  key={followup.id}
                  followup={followup}
                  onUpdate={() =>
                    onUpdateFollowup(
                      followup
                    )
                  }
                  onDelete={() =>
                    onDeleteFollowup(
                      followup.id
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </aside>
    </div>
  );
}