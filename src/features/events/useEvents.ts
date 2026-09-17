import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useApp } from "../../app/AppContext";
import { can } from "../permissions/permissions";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type EventCategory,
  type StaffEvent,
} from "../../services/eventsService";

function startOfMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function startOfNextMonth(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
}

export function useEvents() {
  const {
    user,
    hotelId,
    selectedDate,
  } = useApp();

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(() =>
    startOfMonth(selectedDate)
  );

  const [
    events,
    setEvents,
  ] = useState<StaffEvent[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const canManage = can(
    user.role,
    "events.create"
  );

  const range = useMemo(() => {
    return {
      start:
        startOfMonth(
          currentMonth
        ).toISOString(),

      end:
        startOfNextMonth(
          currentMonth
        ).toISOString(),
    };
  }, [currentMonth]);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rows =
          await getEvents(
            hotelId,
            range.start,
            range.end
          );

        setEvents(rows);
      } catch (err) {
        console.error(
          "Erreur événements :",
          err
        );

        setError(
          "Impossible de charger les événements."
        );
      } finally {
        setLoading(false);
      }
    }, [
      hotelId,
      range.start,
      range.end,
    ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function previousMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  }

  function nextMonth() {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  }

  function goToToday() {
    setCurrentMonth(
      startOfMonth(
        new Date()
      )
    );
  }

  async function addEvent(values: {
    title: string;
    description?: string;
    location?: string;

    category: EventCategory;

    startsAt: string;
    endsAt?: string | null;

    allDay?: boolean;
    pinned?: boolean;

    departmentId?: string | null;
  }) {
    if (!hotelId) return;

    try {
      setError(null);

      const created =
        await createEvent({
          hotelId,
          ...values,
        });

      setEvents(
        (previous) =>
          [...previous, created].sort(
            (a, b) =>
              new Date(
                a.starts_at
              ).getTime() -
              new Date(
                b.starts_at
              ).getTime()
          )
      );

      return created;
    } catch (err) {
      console.error(
        "Erreur création événement :",
        err
      );

      setError(
        "Impossible de créer l’événement."
      );

      throw err;
    }
  }

  async function editEvent(
    id: string,
    values: Parameters<
      typeof updateEvent
    >[1]
  ) {
    try {
      setError(null);

      const updated =
        await updateEvent(
          id,
          values
        );

      setEvents(
        (previous) =>
          previous.map(
            (event) =>
              event.id === id
                ? updated
                : event
          )
      );

      return updated;
    } catch (err) {
      console.error(
        "Erreur modification événement :",
        err
      );

      setError(
        "Impossible de modifier l’événement."
      );

      throw err;
    }
  }

  async function removeEvent(
    id: string
  ) {
    try {
      setError(null);

      await deleteEvent(id);

      setEvents(
        (previous) =>
          previous.filter(
            (event) =>
              event.id !== id
          )
      );
    } catch (err) {
      console.error(
        "Erreur suppression événement :",
        err
      );

      setError(
        "Impossible de supprimer l’événement."
      );

      throw err;
    }
  }

  return {
    events,
    loading,
    error,

    canManage,

    currentMonth,

    previousMonth,
    nextMonth,
    goToToday,

    refresh,

    addEvent,
    editEvent,
    removeEvent,
  };
}