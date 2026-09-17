import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  MapPin,
  Pin,
  Plus,
  Save,
  X,
} from "lucide-react";

import type {
  EventCategory,
  StaffEvent,
} from "../../services/eventsService";

type EventValues = {
  title: string;
  description?: string;
  location?: string;
  category: EventCategory;
  startsAt: string;
  endsAt?: string | null;
  allDay?: boolean;
  pinned?: boolean;
};

type Props = {
  open: boolean;

  defaultDate: Date;

  event?: StaffEvent | null;

  onClose: () => void;

  onSubmit: (
    values: EventValues
  ) => Promise<void>;
};

function formatDateInput(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeInput(
  date: Date
) {
  return `${String(
    date.getHours()
  ).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export function EventModal({
  open,
  defaultDate,
  event,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    location,
    setLocation,
  ] = useState("");

  const [
    category,
    setCategory,
  ] =
    useState<EventCategory>(
      "internal"
    );

  const [date, setDate] =
    useState("");

  const [
    startTime,
    setStartTime,
  ] = useState("09:00");

  const [
    endTime,
    setEndTime,
  ] = useState("10:00");

  const [
    allDay,
    setAllDay,
  ] = useState(false);

  const [
    pinned,
    setPinned,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const isEditing =
    Boolean(event);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (event) {
      const start =
        new Date(
          event.starts_at
        );

      const end =
        event.ends_at
          ? new Date(
              event.ends_at
            )
          : null;

      setTitle(
        event.title
      );

      setDescription(
        event.description ?? ""
      );

      setLocation(
        event.location ?? ""
      );

      setCategory(
        event.category
      );

      setDate(
        formatDateInput(
          start
        )
      );

      setStartTime(
        formatTimeInput(
          start
        )
      );

      setEndTime(
        end
          ? formatTimeInput(end)
          : "10:00"
      );

      setAllDay(
        event.all_day
      );

      setPinned(
        event.pinned
      );

      return;
    }

    setTitle("");
    setDescription("");
    setLocation("");
    setCategory("internal");

    setDate(
      formatDateInput(
        defaultDate
      )
    );

    setStartTime("09:00");
    setEndTime("10:00");

    setAllDay(false);
    setPinned(false);
  }, [
    open,
    defaultDate,
    event,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (
      !title.trim() ||
      !date
    ) {
      return;
    }

    try {
      setSaving(true);

      const startsAt =
        allDay
          ? new Date(
              `${date}T00:00:00`
            ).toISOString()
          : new Date(
              `${date}T${startTime}:00`
            ).toISOString();

      const endsAt =
        allDay
          ? null
          : new Date(
              `${date}T${endTime}:00`
            ).toISOString();

      await onSubmit({
        title:
          title.trim(),

        description:
          description.trim(),

        location:
          location.trim(),

        category,

        startsAt,
        endsAt,

        allDay,
        pinned,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="event-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="event-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="event-modal-header">
          <div>
            <span className="eyebrow">
              {isEditing
                ? "MODIFIER L’ÉVÉNEMENT"
                : "NOUVEL ÉVÉNEMENT"}
            </span>

            <h2>
              {isEditing
                ? "Modifier l’événement"
                : "Ajouter un événement"}
            </h2>

            <p>
              {isEditing
                ? "Modifiez les informations de l’événement."
                : "Ajoutez un événement visible par les équipes."}
            </p>
          </div>

          <button
            type="button"
            className="event-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="event-modal-body">
          <label className="event-form-field">
            <span>Titre</span>

            <input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Ex. Mariage Villa Fito"
            />
          </label>

          <label className="event-form-field">
            <span>Description</span>

            <textarea
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Informations utiles pour les équipes…"
            />
          </label>

          <div className="event-form-grid">
            <label className="event-form-field">
              <span>
                Catégorie
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value as EventCategory
                  )
                }
              >
                <option value="internal">
                  Interne
                </option>

                <option value="guest">
                  Client
                </option>

                <option value="fnb">
                  F&B
                </option>

                <option value="spa">
                  Spa
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="other">
                  Autre
                </option>
              </select>
            </label>

            <label className="event-form-field">
              <span>Lieu</span>

              <div className="event-input-icon">
                <MapPin size={14} />

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Ex. Villa 5"
                />
              </div>
            </label>
          </div>

          <label className="event-form-field">
            <span>Date</span>

            <div className="event-input-icon">
              <CalendarDays
                size={14}
              />

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />
            </div>
          </label>

          <label className="event-check-row">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(event) =>
                setAllDay(
                  event.target.checked
                )
              }
            />

            <span>
              Toute la journée
            </span>
          </label>

          {!allDay && (
            <div className="event-form-grid">
              <label className="event-form-field">
                <span>Début</span>

                <input
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                />
              </label>

              <label className="event-form-field">
                <span>Fin</span>

                <input
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(
                      event.target.value
                    )
                  }
                />
              </label>
            </div>
          )}

          <button
            type="button"
            className={`event-pin-toggle ${
              pinned
                ? "active"
                : ""
            }`}
            onClick={() =>
              setPinned(
                (value) =>
                  !value
              )
            }
          >
            <Pin size={14} />

            {pinned
              ? "Événement épinglé"
              : "Épingler l’événement"}
          </button>
        </div>

        <footer className="event-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              saving ||
              !title.trim() ||
              !date
            }
            onClick={
              handleSubmit
            }
          >
            {isEditing ? (
              <Save size={15} />
            ) : (
              <Plus size={15} />
            )}

            {saving
              ? "Enregistrement…"
              : isEditing
              ? "Enregistrer"
              : "Créer l’événement"}
          </button>
        </footer>
      </div>
    </div>
  );
}