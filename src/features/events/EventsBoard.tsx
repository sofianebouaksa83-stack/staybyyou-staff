import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
} from "lucide-react";

import {
  PageHeader,
} from "../../components/ui/PageHeader";

import type {
  StaffEvent,
} from "../../services/eventsService";

import {
  EventModal,
} from "./EventModal";

import {
  EventsCalendar,
} from "./EventsCalendar";

import {
  EventsList,
} from "./EventsList";

import {
  useEvents,
} from "./useEvents";


type ViewMode =
  | "calendar"
  | "list";


function monthLabel(
  date:
    Date
) {
  const value =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        month:
          "long",

        year:
          "numeric",
      }
    ).format(
      date
    );


  return (
    value
      .charAt(
        0
      )
      .toUpperCase() +
    value.slice(
      1
    )
  );
}


function formatEventDate(
  event:
    StaffEvent
) {
  const start =
    new Date(
      event.starts_at
    );


  const startText =
    new Intl.DateTimeFormat(
      "fr-FR",
      event.all_day
        ? {
            dateStyle:
              "full",
          }
        : {
            dateStyle:
              "full",

            timeStyle:
              "short",
          }
    ).format(
      start
    );


  if (
    !event.ends_at
  ) {
    return startText;
  }


  let end =
    new Date(
      event.ends_at
    );


  if (
    event.all_day
  ) {
    end =
      new Date(
        end.getTime() -
          1
      );
  }


  const sameDate =
    start.getFullYear() ===
      end.getFullYear() &&
    start.getMonth() ===
      end.getMonth() &&
    start.getDate() ===
      end.getDate();


  if (
    event.all_day &&
    sameDate
  ) {
    return startText;
  }


  const endText =
    new Intl.DateTimeFormat(
      "fr-FR",
      event.all_day
        ? {
            dateStyle:
              "full",
          }
        : {
            dateStyle:
              "full",

            timeStyle:
              "short",
          }
    ).format(
      end
    );


  return `${startText} → ${endText}`;
}


export function EventsBoard() {
  const {
    events,
    departments,

    loading,
    error,

    canView,
    canManage,

    loadingPermissions,

    currentMonth,

    previousMonth,
    nextMonth,
    goToToday,

    addEvent,
    editEvent,
    removeEvent,
  } =
    useEvents();


  const [
    editingEvent,
    setEditingEvent,
  ] =
    useState<
      StaffEvent | null
    >(
      null
    );


  const [
    view,
    setView,
  ] =
    useState<ViewMode>(
      () =>
        window.matchMedia(
          "(max-width: 760px)"
        ).matches
          ? "list"
          : "calendar"
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(
      false
    );


  const [
    selectedEvent,
    setSelectedEvent,
  ] =
    useState<
      StaffEvent | null
    >(
      null
    );


  useEffect(() => {
    const media =
      window.matchMedia(
        "(max-width: 760px)"
      );


    function updateView() {
      if (
        media.matches
      ) {
        setView(
          "list"
        );
      }
    }


    media.addEventListener(
      "change",
      updateView
    );


    return () =>
      media.removeEventListener(
        "change",
        updateView
      );
  }, []);


  const sortedEvents =
    useMemo(
      () =>
        [
          ...events,
        ].sort(
          (
            a,
            b
          ) =>
            new Date(
              a.starts_at
            ).getTime() -
            new Date(
              b.starts_at
            ).getTime()
        ),
      [
        events,
      ]
    );


  if (
    loadingPermissions
  ) {
    return (
      <>
        <PageHeader
          title="Événements"

          subtitle="Une vue claire des événements qui impactent les équipes."
        />

        <div className="events-empty">
          Vérification des permissions…
        </div>
      </>
    );
  }


  if (
    !canView
  ) {
    return (
      <>
        <PageHeader
          title="Événements"

          subtitle="Une vue claire des événements qui impactent les équipes."
        />

        <div className="events-empty">
          Vous n’avez pas accès aux événements.
        </div>
      </>
    );
  }


  return (
    <>
      <PageHeader
        title="Événements"

        subtitle="Une vue claire des événements qui impactent les équipes."

        action={
          canManage ? (
            <button
              type="button"
              className="primary-button small-button"

              onClick={() => {
                setEditingEvent(
                  null
                );

                setModalOpen(
                  true
                );
              }}
            >
              <Plus
                size={16}
              />

              Nouvel événement
            </button>
          ) : undefined
        }
      />


      <div className="events-toolbar">
        <div className="events-view-switch">
          <button
            type="button"

            className={
              view ===
              "calendar"
                ? "active"
                : ""
            }

            onClick={() =>
              setView(
                "calendar"
              )
            }
          >
            <CalendarDays
              size={14}
            />

            Calendrier
          </button>


          <button
            type="button"

            className={
              view ===
              "list"
                ? "active"
                : ""
            }

            onClick={() =>
              setView(
                "list"
              )
            }
          >
            <List
              size={14}
            />

            Liste
          </button>
        </div>


        <div className="events-month-nav">
          <button
            type="button"
            className="events-nav-button"

            onClick={
              previousMonth
            }
          >
            <ChevronLeft
              size={16}
            />
          </button>


          <button
            type="button"
            className="events-month-label"

            onClick={
              goToToday
            }

            title="Revenir au mois actuel"
          >
            {monthLabel(
              currentMonth
            )}
          </button>


          <button
            type="button"
            className="events-nav-button"

            onClick={
              nextMonth
            }
          >
            <ChevronRight
              size={16}
            />
          </button>
        </div>
      </div>


      {error && (
        <div className="events-error">
          {error}
        </div>
      )}


      {loading ? (
        <div className="events-empty">
          Chargement des événements…
        </div>
      ) : view ===
        "calendar" ? (
        <EventsCalendar
          currentMonth={
            currentMonth
          }

          events={
            events
          }

          onEventClick={
            setSelectedEvent
          }
        />
      ) : (
        <EventsList
          events={
            sortedEvents
          }

          onEventClick={
            setSelectedEvent
          }
        />
      )}


      {canManage && (
        <EventModal
          open={
            modalOpen ||
            Boolean(
              editingEvent
            )
          }

          defaultDate={
            editingEvent
              ? new Date(
                  editingEvent.starts_at
                )
              : currentMonth
          }

          event={
            editingEvent
          }

          departments={
            departments
          }

          onClose={() => {
            setModalOpen(
              false
            );

            setEditingEvent(
              null
            );
          }}

          onSubmit={async (
            values
          ) => {
            if (
              editingEvent
            ) {
              await editEvent(
                editingEvent.id,
                {
                  title:
                    values.title,

                  description:
                    values.description ||
                    null,

                  location:
                    values.location ||
                    null,

                  department_id:
                    values.departmentId ??
                    null,

                  category:
                    values.category,

                  starts_at:
                    values.startsAt,

                  ends_at:
                    values.endsAt ??
                    null,

                  all_day:
                    values.allDay ??
                    false,

                  pinned:
                    values.pinned ??
                    false,
                }
              );


              setEditingEvent(
                null
              );

              return;
            }


            await addEvent(
              values
            );
          }}
        />
      )}


      {selectedEvent && (
        <div
          className="event-detail-backdrop"

          onClick={() =>
            setSelectedEvent(
              null
            )
          }
        >
          <div
            className="event-detail-card"

            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="event-detail-close"

              onClick={() =>
                setSelectedEvent(
                  null
                )
              }
            >
              ×
            </button>


            <span className="eyebrow">
              ÉVÉNEMENT
            </span>


            <h2>
              {
                selectedEvent.title
              }
            </h2>


            {selectedEvent.description && (
              <p>
                {
                  selectedEvent.description
                }
              </p>
            )}


            <div className="event-detail-meta">
              {selectedEvent.department && (
                <span>
                  Service :{" "}
                  <strong>
                    {
                      selectedEvent
                        .department
                        .name
                    }
                  </strong>
                </span>
              )}


              {selectedEvent.location && (
                <span>
                  Lieu :{" "}
                  <strong>
                    {
                      selectedEvent.location
                    }
                  </strong>
                </span>
              )}


              <span>
                {
                  formatEventDate(
                    selectedEvent
                  )
                }
              </span>
            </div>


            {canManage && (
              <button
                type="button"
                className="event-edit-button"

                onClick={() => {
                  setEditingEvent(
                    selectedEvent
                  );

                  setSelectedEvent(
                    null
                  );
                }}
              >
                Modifier
              </button>
            )}


            {canManage && (
              <button
                type="button"
                className="event-delete-button"

                onClick={async () => {
                  if (
                    !window.confirm(
                      "Supprimer cet événement ?"
                    )
                  ) {
                    return;
                  }


                  await removeEvent(
                    selectedEvent.id
                  );


                  setSelectedEvent(
                    null
                  );
                }}
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}