import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useApp } from "../../app/AppContext";

import {
  getTasks,
  subscribeToTasks,
  type StaffTask,
} from "../../services/tasksService";

import {
  getHotelStays,
  getFollowups,
  type HotelStay,
  type GuestFollowup,
} from "../../services/hotelService";

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);

  next.setHours(
    0,
    0,
    0,
    0
  );

  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);

  next.setHours(
    23,
    59,
    59,
    999
  );

  return next;
}

function isSameDay(
  value: string,
  date: Date
) {
  const current =
    new Date(value);

  return (
    current.getFullYear() ===
      date.getFullYear() &&
    current.getMonth() ===
      date.getMonth() &&
    current.getDate() ===
      date.getDate()
  );
}

export function useDashboard() {
  const {
    user,
    hotelId,
    selectedDate,
  } = useApp();

  const [
    tasks,
    setTasks,
  ] = useState<StaffTask[]>([]);

  const [
    stays,
    setStays,
  ] = useState<HotelStay[]>([]);

  const [
    followups,
    setFollowups,
  ] = useState<GuestFollowup[]>([]);

  const [
    loadingTasks,
    setLoadingTasks,
  ] = useState(true);

  const [
    loadingHotel,
    setLoadingHotel,
  ] = useState(true);

  const [
    tasksError,
    setTasksError,
  ] = useState<string | null>(
    null
  );

  const [
    hotelError,
    setHotelError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      if (!hotelId) {
        setTasks([]);
        setLoadingTasks(false);
        return;
      }

      try {
        setLoadingTasks(true);
        setTasksError(null);

        const rows =
          await getTasks(
            hotelId,
            formatDateKey(
              selectedDate
            )
          );

        if (!cancelled) {
          setTasks(rows);
        }
      } catch (error) {
        console.error(
          "Erreur chargement tâches dashboard :",
          error
        );

        if (!cancelled) {
          setTasksError(
            "Impossible de charger les tâches."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingTasks(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    selectedDate,
  ]);

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    const unsubscribe =
      subscribeToTasks(
        hotelId,
        async () => {
          try {
            const rows =
              await getTasks(
                hotelId,
                formatDateKey(
                  selectedDate
                )
              );

            setTasks(rows);
          } catch (error) {
            console.error(
              "Erreur realtime dashboard tasks :",
              error
            );
          }
        }
      );

    return unsubscribe;
  }, [
    hotelId,
    selectedDate,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadHotelData() {
      if (!hotelId) {
        setStays([]);
        setFollowups([]);
        setLoadingHotel(false);
        return;
      }

      try {
        setLoadingHotel(true);
        setHotelError(null);

        const start =
          startOfDay(
            selectedDate
          );

        const end =
          endOfDay(
            selectedDate
          );

        const hotelStays =
          await getHotelStays(
            hotelId,
            start.toISOString(),
            end.toISOString()
          );

        const followupLists =
          await Promise.all(
            hotelStays.map(
              (stay) =>
                getFollowups(
                  hotelId,
                  stay.id
                )
            )
          );

        if (cancelled) {
          return;
        }

        setStays(
          hotelStays
        );

        setFollowups(
          followupLists.flat()
        );
      } catch (error) {
        console.error(
          "Erreur chargement hôtel dashboard :",
          error
        );

        if (!cancelled) {
          setHotelError(
            "Impossible de charger les données hôtel."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHotel(false);
        }
      }
    }

    loadHotelData();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    selectedDate,
  ]);

  const openTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status !==
              "done" &&
            task.status !==
              "cancelled"
        ),
      [tasks]
    );

  const dashboardTasks =
    useMemo(() => {
      const priorityWeight = {
        urgent: 3,
        high: 2,
        normal: 1,
      };

      return [...openTasks]
        .sort((a, b) => {
          const priorityDiff =
            priorityWeight[
              b.priority
            ] -
            priorityWeight[
              a.priority
            ];

          if (
            priorityDiff !== 0
          ) {
            return priorityDiff;
          }

          const aTime =
            a.due_at
              ? new Date(
                  a.due_at
                ).getTime()
              : Infinity;

          const bTime =
            b.due_at
              ? new Date(
                  b.due_at
                ).getTime()
              : Infinity;

          return aTime - bTime;
        })
        .slice(0, 4);
    }, [openTasks]);

  const arrivals =
    useMemo(
      () =>
        stays.filter(
          (stay) =>
            isSameDay(
              stay.starts_at,
              selectedDate
            )
        ),
      [
        stays,
        selectedDate,
      ]
    );

  const departures =
    useMemo(
      () =>
        stays.filter(
          (stay) =>
            isSameDay(
              stay.ends_at,
              selectedDate
            )
        ),
      [
        stays,
        selectedDate,
      ]
    );

  const inHouse =
    useMemo(() => {
      const start =
        startOfDay(
          selectedDate
        ).getTime();

      const end =
        endOfDay(
          selectedDate
        ).getTime();

      return stays.filter(
        (stay) => {
          const stayStart =
            new Date(
              stay.starts_at
            ).getTime();

          const stayEnd =
            new Date(
              stay.ends_at
            ).getTime();

          return (
            stayStart < end &&
            stayEnd > start
          );
        }
      );
    }, [
      stays,
      selectedDate,
    ]);

  const activeFollowups =
    useMemo(
      () =>
        followups.filter(
          (followup) =>
            followup.status !==
            "resolved"
        ),
      [followups]
    );

  const urgentFollowups =
    useMemo(
      () =>
        activeFollowups.filter(
          (followup) =>
            followup.priority ===
            "urgent"
        ),
      [activeFollowups]
    );

  return {
    user,
    selectedDate,

    openTasks,
    dashboardTasks,

    arrivals,
    departures,
    inHouse,

    activeFollowups,
    urgentFollowups,

    loadingTasks,
    loadingHotel,

    tasksError,
    hotelError,
  };
}