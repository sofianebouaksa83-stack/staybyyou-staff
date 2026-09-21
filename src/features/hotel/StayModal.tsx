import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Save,
  UserPlus,
  X,
} from "lucide-react";

import type {
  HotelRoom,
  HotelStay,
} from "../../services/hotelService";


type Props = {
  open:
    boolean;

  stay?:
    HotelStay | null;

  rooms:
    HotelRoom[];

  saving:
    boolean;

  onClose:
    () => void;

  onSubmit: (
    values: {
      roomId:
        string;

      guestName:
        string;

      accessCode:
        string;

      startsAt:
        string;

      endsAt:
        string;
    }
  ) => Promise<void>;
};


function toLocalInput(
  value:
    string
) {
  const date =
    new Date(
      value
    );

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60000
    );

  return localDate
    .toISOString()
    .slice(
      0,
      16
    );
}


function defaultStart() {
  const now =
    new Date();

  now.setMinutes(
    0,
    0,
    0
  );

  return toLocalInput(
    now.toISOString()
  );
}


function defaultEnd() {
  const end =
    new Date();

  end.setDate(
    end.getDate() +
      1
  );

  end.setHours(
    11,
    0,
    0,
    0
  );

  return toLocalInput(
    end.toISOString()
  );
}


export function StayModal({
  open,
  stay,
  rooms,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [
    roomId,
    setRoomId,
  ] =
    useState("");

  const [
    guestName,
    setGuestName,
  ] =
    useState("");

  const [
    accessCode,
    setAccessCode,
  ] =
    useState("");

  const [
    startsAt,
    setStartsAt,
  ] =
    useState(
      defaultStart()
    );

  const [
    endsAt,
    setEndsAt,
  ] =
    useState(
      defaultEnd()
    );

  const [
    localError,
    setLocalError,
  ] =
    useState<
      string | null
    >(null);


  const isEditing =
    Boolean(
      stay
    );

  const externalStay =
    stay &&
    stay.source !==
      "staybyyou";


  useEffect(() => {
    if (!open) {
      return;
    }


    setLocalError(
      null
    );


    if (stay) {
      setRoomId(
        stay.room_id
      );

      setGuestName(
        stay.guest_name
      );

      setAccessCode(
        ""
      );

      setStartsAt(
        toLocalInput(
          stay.starts_at
        )
      );

      setEndsAt(
        toLocalInput(
          stay.ends_at
        )
      );

      return;
    }


    setRoomId(
      rooms[0]?.id ??
        ""
    );

    setGuestName(
      ""
    );

    setAccessCode(
      ""
    );

    setStartsAt(
      defaultStart()
    );

    setEndsAt(
      defaultEnd()
    );
  }, [
    open,
    stay,
    rooms,
  ]);


  const canSubmit =
    useMemo(() => {
      if (
        !roomId ||
        !guestName.trim() ||
        !startsAt ||
        !endsAt
      ) {
        return false;
      }


      if (
        !isEditing &&
        !/^\d{4,8}$/.test(
          accessCode
        )
      ) {
        return false;
      }


      if (
        isEditing &&
        accessCode &&
        !/^\d{4,8}$/.test(
          accessCode
        )
      ) {
        return false;
      }


      return (
        new Date(
          endsAt
        ).getTime() >
        new Date(
          startsAt
        ).getTime()
      );
    }, [
      roomId,
      guestName,
      startsAt,
      endsAt,
      accessCode,
      isEditing,
    ]);


  if (!open) {
    return null;
  }


  async function handleSubmit() {
    if (
      !canSubmit ||
      saving ||
      externalStay
    ) {
      return;
    }


    try {
      setLocalError(
        null
      );


      await onSubmit({
        roomId,

        guestName:
          guestName.trim(),

        accessCode:
          accessCode.trim(),

        startsAt:
          new Date(
            startsAt
          ).toISOString(),

        endsAt:
          new Date(
            endsAt
          ).toISOString(),
      });
    } catch (
      error
    ) {
      console.error(
        "Erreur séjour :",
        error
      );

      setLocalError(
        error instanceof
          Error
          ? error.message
          : "Impossible d'enregistrer le séjour."
      );
    }
  }


  return (
    <div
      className="followup-modal-backdrop"

      onClick={() => {
        if (
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div
        className="followup-modal"

        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="followup-modal-header">
          <div>
            <span className="eyebrow">
              {isEditing
                ? "MODIFIER LE SÉJOUR"
                : "NOUVEAU SÉJOUR"}
            </span>

            <h2>
              {isEditing
                ? "Modifier le séjour"
                : "Créer un séjour"}
            </h2>

            <p>
              Gestion interne StayByYou.
              Les séjours Opera seront
              synchronisés ici plus tard.
            </p>
          </div>


          <button
            type="button"
            className="followup-modal-close"

            onClick={
              onClose
            }

            disabled={
              saving
            }
          >
            <X
              size={18}
            />
          </button>
        </header>


        <div className="followup-modal-body">
          {externalStay && (
            <div className="hotel-error">
              Ce séjour provient d’un système externe et est en lecture seule.
            </div>
          )}


          {localError && (
            <div className="hotel-error">
              {localError}
            </div>
          )}


          <label className="followup-form-field">
            <span>
              Client
            </span>

            <input
              type="text"

              value={
                guestName
              }

              onChange={(
                event
              ) =>
                setGuestName(
                  event.target.value
                )
              }

              disabled={
                saving ||
                Boolean(
                  externalStay
                )
              }

              placeholder="Nom du client"
            />
          </label>


          <label className="followup-form-field">
            <span>
              Chambre / villa
            </span>

            <select
              value={
                roomId
              }

              onChange={(
                event
              ) =>
                setRoomId(
                  event.target.value
                )
              }

              disabled={
                saving ||
                Boolean(
                  externalStay
                )
              }
            >
              {rooms.map(
                (
                  room
                ) => (
                  <option
                    key={
                      room.id
                    }

                    value={
                      room.id
                    }
                  >
                    {
                      room.name
                    }

                    {room.code
                      ? ` — ${room.code}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </label>


          <div className="followup-form-grid">
            <label className="followup-form-field">
              <span>
                Arrivée
              </span>

              <input
                type="datetime-local"

                value={
                  startsAt
                }

                onChange={(
                  event
                ) =>
                  setStartsAt(
                    event.target.value
                  )
                }

                disabled={
                  saving ||
                  Boolean(
                    externalStay
                  )
                }
              />
            </label>


            <label className="followup-form-field">
              <span>
                Départ
              </span>

              <input
                type="datetime-local"

                value={
                  endsAt
                }

                onChange={(
                  event
                ) =>
                  setEndsAt(
                    event.target.value
                  )
                }

                disabled={
                  saving ||
                  Boolean(
                    externalStay
                  )
                }
              />
            </label>
          </div>


          {!externalStay && (
            <label className="followup-form-field">
              <span>
                {isEditing
                  ? "Nouveau code d’accès — facultatif"
                  : "Code d’accès client"}
              </span>

              <input
                type="text"

                inputMode="numeric"

                value={
                  accessCode
                }

                onChange={(
                  event
                ) =>
                  setAccessCode(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }

                minLength={
                  4
                }

                maxLength={
                  8
                }

                disabled={
                  saving
                }

                placeholder={
                  isEditing
                    ? "Laisser vide pour conserver le code"
                    : "4 à 8 chiffres"
                }
              />
            </label>
          )}
        </div>


        <footer className="followup-modal-footer">
          <button
            type="button"
            className="secondary-button"

            onClick={
              onClose
            }

            disabled={
              saving
            }
          >
            Annuler
          </button>


          {!externalStay && (
            <button
              type="button"
              className="primary-button"

              disabled={
                !canSubmit ||
                saving
              }

              onClick={() =>
                void handleSubmit()
              }
            >
              {isEditing ? (
                <Save
                  size={15}
                />
              ) : (
                <UserPlus
                  size={15}
                />
              )}

              {saving
                ? "Enregistrement…"
                : isEditing
                ? "Enregistrer"
                : "Créer le séjour"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}