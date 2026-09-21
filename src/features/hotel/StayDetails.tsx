import {
  BedDouble,
  CalendarDays,
  Pencil,
  Plus,
  Power,
  X,
} from "lucide-react";

import type {
  GuestFollowup,
  HotelStay,
} from "../../services/hotelService";

import {
  FollowupCard,
} from "./FollowupCard";


type Props = {
  stay:
    HotelStay | null;

  followups:
    GuestFollowup[];

  loadingFollowups:
    boolean;

  canManageFollowups:
    boolean;

  canManageStays:
    boolean;

  endingStay:
    boolean;

  onClose:
    () => void;

  onEditStay:
    () => void;

  onEndStay:
    () => void;

  onAddFollowup:
    () => void;

  onUpdateFollowup: (
    followup:
      GuestFollowup
  ) => void;

  onDeleteFollowup: (
    id:
      string
  ) => void;
};


function formatDate(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",
    }
  ).format(
    new Date(
      value
    )
  );
}


function sourceLabel(
  source:
    string
) {
  switch (
    source
  ) {
    case "opera":
      return "Opera";

    case "staybyyou":
      return "StayByYou";

    default:
      return source;
  }
}


export function StayDetails({
  stay,
  followups,
  loadingFollowups,
  canManageFollowups,
  canManageStays,
  endingStay,
  onClose,
  onEditStay,
  onEndStay,
  onAddFollowup,
  onUpdateFollowup,
  onDeleteFollowup,
}: Props) {
  if (!stay) {
    return null;
  }


  const isInternal =
    stay.source ===
    "staybyyou";


  const canEditStay =
    canManageStays &&
    isInternal &&
    stay.active;


  return (
    <div
      className="stay-detail-backdrop"

      onClick={
        onClose
      }
    >
      <aside
        className="stay-detail-panel"

        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="stay-detail-header">
          <div>
            <div className="stay-detail-source-line">
              <span className="eyebrow">
                SÉJOUR CLIENT
              </span>

              <span
                className={
                  stay.source ===
                  "opera"
                    ? "stay-source-badge external"
                    : "stay-source-badge"
                }
              >
                {sourceLabel(
                  stay.source
                )}
              </span>
            </div>

            <h2>
              {
                stay.guest_name
              }
            </h2>
          </div>


          <button
            type="button"
            className="stay-detail-close"

            onClick={
              onClose
            }

            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
        </header>


        <div className="stay-detail-info">
          <span>
            <BedDouble
              size={14}
            />

            {stay.room?.name ??
              "Chambre inconnue"}
          </span>


          <span>
            <CalendarDays
              size={14}
            />

            {formatDate(
              stay.starts_at
            )}

            {" → "}

            {formatDate(
              stay.ends_at
            )}
          </span>
        </div>


        {!stay.active && (
          <div className="stay-ended-banner">
            Séjour terminé
          </div>
        )}


        {stay.source !==
          "staybyyou" && (
          <div className="stay-external-banner">
            Ce séjour provient d’un système externe.
            Il est affiché ici en lecture seule.
          </div>
        )}


        {canEditStay && (
          <div className="stay-management-actions">
            <button
              type="button"
              className="secondary-button"

              onClick={
                onEditStay
              }
            >
              <Pencil
                size={14}
              />

              Modifier le séjour
            </button>


            <button
              type="button"
              className="stay-end-button"

              onClick={
                onEndStay
              }

              disabled={
                endingStay
              }
            >
              <Power
                size={14}
              />

              {endingStay
                ? "Fin du séjour…"
                : "Terminer le séjour"}
            </button>
          </div>
        )}


        <div className="stay-followups-header">
          <div>
            <span className="eyebrow">
              SUIVI CLIENT
            </span>

            <h3>
              Historique
            </h3>
          </div>


          {canManageFollowups && (
            <button
              type="button"
              className="primary-button small-button"

              onClick={
                onAddFollowup
              }
            >
              <Plus
                size={14}
              />

              Ajouter
            </button>
          )}
        </div>


        {loadingFollowups ? (
          <div className="stay-followups-empty">
            Chargement du suivi…
          </div>
        ) : followups.length ===
          0 ? (
          <div className="stay-followups-empty">
            Aucun suivi pour ce client.
          </div>
        ) : (
          <div className="stay-followups-list">
            {followups.map(
              (
                followup
              ) => (
                <FollowupCard
                  key={
                    followup.id
                  }

                  followup={
                    followup
                  }

                  canManage={
                    canManageFollowups
                  }

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