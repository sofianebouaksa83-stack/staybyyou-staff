import {
  useEffect,
  useMemo,
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
  EventDepartment,
  StaffEvent,
} from "../../services/eventsService";


type EventValues = {
  title: string;

  description?:
    string;

  location?:
    string;

  category:
    EventCategory;

  startsAt:
    string;

  endsAt?:
    string | null;

  allDay?:
    boolean;

  pinned?:
    boolean;

  departmentId?:
    string | null;
};


type Props = {
  open:
    boolean;

  defaultDate:
    Date;

  event?:
    StaffEvent | null;

  departments:
    EventDepartment[];

  onClose:
    () => void;

  onSubmit: (
    values:
      EventValues
  ) => Promise<void>;
};


function formatDateInput(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function formatTimeInput(
  date: Date
) {
  return `${String(
    date.getHours()
  ).padStart(
    2,
    "0"
  )}:${String(
    date.getMinutes()
  ).padStart(
    2,
    "0"
  )}`;
}


function allDayEndDate(
  event:
    StaffEvent
) {
  if (
    !event.ends_at
  ) {
    return formatDateInput(
      new Date(
        event.starts_at
      )
    );
  }


  const end =
    new Date(
      event.ends_at
    );

  end.setMilliseconds(
    end.getMilliseconds() -
      1
  );


  return formatDateInput(
    end
  );
}


export function EventModal({
  open,
  defaultDate,
  event,
  departments,
  onClose,
  onSubmit,
}: Props) {
  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    location,
    setLocation,
  ] =
    useState("");


  const [
    departmentId,
    setDepartmentId,
  ] =
    useState("");


  const [
    category,
    setCategory,
  ] =
    useState<EventCategory>(
      "internal"
    );


  const [
    startDate,
    setStartDate,
  ] =
    useState("");


  const [
    endDate,
    setEndDate,
  ] =
    useState("");


  const [
    startTime,
    setStartTime,
  ] =
    useState(
      "09:00"
    );


  const [
    endTime,
    setEndTime,
  ] =
    useState(
      "10:00"
    );


  const [
    allDay,
    setAllDay,
  ] =
    useState(
      false
    );


  const [
    pinned,
    setPinned,
  ] =
    useState(
      false
    );


  const [
    saving,
    setSaving,
  ] =
    useState(
      false
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
      event
    );


  useEffect(() => {
    if (!open) {
      return;
    }


    setLocalError(
      null
    );


    if (
      event
    ) {
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
        event.description ??
          ""
      );

      setLocation(
        event.location ??
          ""
      );

      setDepartmentId(
        event.department_id ??
          ""
      );

      setCategory(
        event.category
      );

      setStartDate(
        formatDateInput(
          start
        )
      );


      if (
        event.all_day
      ) {
        setEndDate(
          allDayEndDate(
            event
          )
        );
      } else {
        setEndDate(
          end
            ? formatDateInput(
                end
              )
            : formatDateInput(
                start
              )
        );
      }


      setStartTime(
        formatTimeInput(
          start
        )
      );

      setEndTime(
        end
          ? formatTimeInput(
              end
            )
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


    const baseDate =
      formatDateInput(
        defaultDate
      );


    setTitle(
      ""
    );

    setDescription(
      ""
    );

    setLocation(
      ""
    );

    setDepartmentId(
      ""
    );

    setCategory(
      "internal"
    );

    setStartDate(
      baseDate
    );

    setEndDate(
      baseDate
    );

    setStartTime(
      "09:00"
    );

    setEndTime(
      "10:00"
    );

    setAllDay(
      false
    );

    setPinned(
      false
    );
  }, [
    open,
    defaultDate,
    event,
  ]);


  const range =
    useMemo(() => {
      if (
        !startDate ||
        !endDate
      ) {
        return null;
      }


      if (
        allDay
      ) {
        const start =
          new Date(
            `${startDate}T00:00:00`
          );


        const end =
          new Date(
            `${endDate}T00:00:00`
          );


        end.setDate(
          end.getDate() +
            1
        );


        return {
          start,
          end,
        };
      }


      const start =
        new Date(
          `${startDate}T${startTime}:00`
        );


      const end =
        new Date(
          `${endDate}T${endTime}:00`
        );


      return {
        start,
        end,
      };
    }, [
      startDate,
      endDate,
      startTime,
      endTime,
      allDay,
    ]);


  const canSubmit =
    Boolean(
      title.trim() &&
      range &&
      range.end.getTime() >
        range.start.getTime()
    );


  if (!open) {
    return null;
  }


  async function handleSubmit() {
    if (
      !canSubmit ||
      !range ||
      saving
    ) {
      return;
    }


    try {
      setSaving(
        true
      );

      setLocalError(
        null
      );


      await onSubmit({
        title:
          title.trim(),

        description:
          description.trim(),

        location:
          location.trim(),

        departmentId:
          departmentId ||
          null,

        category,

        startsAt:
          range.start
            .toISOString(),

        endsAt:
          range.end
            .toISOString(),

        allDay,

        pinned,
      });


      onClose();
    } catch (
      err
    ) {
      console.error(
        "Erreur événement :",
        err
      );

      setLocalError(
        err instanceof
          Error
          ? err.message
          : "Impossible d’enregistrer l’événement."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  return (
    <div
      className="event-modal-backdrop"

      onClick={() => {
        if (
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div
        className="event-modal"

        onClick={(
          event
        ) =>
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


        <div className="event-modal-body">
          {localError && (
            <div className="event-form-error">
              {localError}
            </div>
          )}


          <label className="event-form-field">
            <span>
              Titre
            </span>

            <input
              autoFocus

              value={
                title
              }

              onChange={(
                event
              ) =>
                setTitle(
                  event.target.value
                )
              }

              placeholder="Ex. Mariage Villa Fito"
            />
          </label>


          <label className="event-form-field">
            <span>
              Description
            </span>

            <textarea
              rows={
                4
              }

              value={
                description
              }

              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }

              placeholder="Informations utiles pour les équipes…"
            />
          </label>


          <label className="event-form-field">
            <span>
              Service concerné
            </span>

            <select
              value={
                departmentId
              }

              onChange={(
                event
              ) =>
                setDepartmentId(
                  event.target.value
                )
              }
            >
              <option value="">
                Tout l’hôtel
              </option>

              {departments.map(
                (
                  department
                ) => (
                  <option
                    key={
                      department.id
                    }

                    value={
                      department.id
                    }
                  >
                    {
                      department.name
                    }
                  </option>
                )
              )}
            </select>
          </label>


          <div className="event-form-grid">
            <label className="event-form-field">
              <span>
                Catégorie
              </span>

              <select
                value={
                  category
                }

                onChange={(
                  event
                ) =>
                  setCategory(
                    event.target
                      .value as
                      EventCategory
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
              <span>
                Lieu
              </span>

              <div className="event-input-icon">
                <MapPin
                  size={14}
                />

                <input
                  value={
                    location
                  }

                  onChange={(
                    event
                  ) =>
                    setLocation(
                      event.target.value
                    )
                  }

                  placeholder="Ex. Villa 5"
                />
              </div>
            </label>
          </div>


          <label className="event-check-row">
            <input
              type="checkbox"

              checked={
                allDay
              }

              onChange={(
                event
              ) =>
                setAllDay(
                  event.target.checked
                )
              }
            />

            <span>
              Toute la journée
            </span>
          </label>


          <div className="event-form-grid">
            <label className="event-form-field">
              <span>
                Date de début
              </span>

              <div className="event-input-icon">
                <CalendarDays
                  size={14}
                />

                <input
                  type="date"

                  value={
                    startDate
                  }

                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target.value;

                    setStartDate(
                      value
                    );

                    if (
                      !endDate ||
                      endDate <
                        value
                    ) {
                      setEndDate(
                        value
                      );
                    }
                  }}
                />
              </div>
            </label>


            <label className="event-form-field">
              <span>
                Date de fin
              </span>

              <div className="event-input-icon">
                <CalendarDays
                  size={14}
                />

                <input
                  type="date"

                  value={
                    endDate
                  }

                  min={
                    startDate
                  }

                  onChange={(
                    event
                  ) =>
                    setEndDate(
                      event.target.value
                    )
                  }
                />
              </div>
            </label>
          </div>


          {!allDay && (
            <div className="event-form-grid">
              <label className="event-form-field">
                <span>
                  Heure de début
                </span>

                <input
                  type="time"

                  value={
                    startTime
                  }

                  onChange={(
                    event
                  ) =>
                    setStartTime(
                      event.target.value
                    )
                  }
                />
              </label>


              <label className="event-form-field">
                <span>
                  Heure de fin
                </span>

                <input
                  type="time"

                  value={
                    endTime
                  }

                  onChange={(
                    event
                  ) =>
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

            className={
              `event-pin-toggle ${
                pinned
                  ? "active"
                  : ""
              }`
            }

            onClick={() =>
              setPinned(
                (
                  value
                ) =>
                  !value
              )
            }
          >
            <Pin
              size={14}
            />

            {pinned
              ? "Événement épinglé"
              : "Épingler l’événement"}
          </button>
        </div>


        <footer className="event-modal-footer">
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


          <button
            type="button"
            className="primary-button"

            disabled={
              saving ||
              !canSubmit
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
              <Plus
                size={15}
              />
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