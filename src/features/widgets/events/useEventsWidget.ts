import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useApp,
} from "../../../app/AppContext";
import {
  getEvents,
  type StaffEvent,
} from "../../../services/eventsService";

function startOfDay(
  date: Date
) {
  const next =
    new Date(date);

  next.setHours(
    0,
    0,
    0,
    0
  );

  return next;
}

function endOfDay(
  date: Date
) {
  const next =
    new Date(date);

  next.setHours(
    23,
    59,
    59,
    999
  );

  return next;
}

export function useEventsWidget() {
  const {
    hotelId,
    selectedDate,
  } = useApp();

  const [
    events,
    setEvents,
  ] = useState<
    StaffEvent[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function load() {
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
            startOfDay(
              selectedDate
            ).toISOString(),
            endOfDay(
              selectedDate
            ).toISOString()
          );

        if (active) {
          setEvents(rows);
        }
      } catch (loadError) {
        console.error(
          "Erreur événements widget :",
          loadError
        );

        if (active) {
          setError(
            "Impossible de charger les événements."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [
    hotelId,
    selectedDate,
  ]);

  const sortedEvents =
    useMemo(
      () =>
        [...events].sort(
          (a, b) =>
            new Date(
              a.starts_at
            ).getTime() -
            new Date(
              b.starts_at
            ).getTime()
        ),
      [events]
    );

  return {
    events:
      sortedEvents,
    loading,
    error,
  };
}
