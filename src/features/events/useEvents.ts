import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useApp,
} from "../../app/AppContext";

import {
  useHotelPermission,
} from "../permissions/hooks/useHotelPermission";

import {
  createEvent,
  deleteEvent,
  getEventDepartments,
  getEvents,
  updateEvent,

  type EventCategory,
  type EventDepartment,
  type StaffEvent,
} from "../../services/eventsService";


function startOfMonth(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}


function startOfNextMonth(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
}


export function useEvents() {
  const {
    hotelId,
    selectedDate,
  } =
    useApp();


  const {
    allowed:
      canView,

    loading:
      loadingViewPermission,
  } =
    useHotelPermission(
      hotelId,
      "events.view"
    );


  const {
    allowed:
      canManage,

    loading:
      loadingManagePermission,
  } =
    useHotelPermission(
      hotelId,
      "events.manage"
    );


  const [
    currentMonth,
    setCurrentMonth,
  ] =
    useState(
      () =>
        startOfMonth(
          selectedDate
        )
    );


  const [
    events,
    setEvents,
  ] =
    useState<
      StaffEvent[]
    >([]);


  const [
    departments,
    setDepartments,
  ] =
    useState<
      EventDepartment[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    setCurrentMonth(
      startOfMonth(
        selectedDate
      )
    );
  }, [
    selectedDate,
  ]);


  const range =
    useMemo(() => {
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
    }, [
      currentMonth,
    ]);


  const refresh =
    useCallback(
      async () => {
        if (
          loadingViewPermission
        ) {
          return;
        }


        if (
          !hotelId ||
          !canView
        ) {
          setEvents(
            []
          );

          setLoading(
            false
          );

          return;
        }


        try {
          setLoading(
            true
          );

          setError(
            null
          );


          const rows =
            await getEvents(
              hotelId,
              range.start,
              range.end
            );


          setEvents(
            rows
          );
        } catch (
          err
        ) {
          console.error(
            "Erreur événements :",
            err
          );

          setError(
            "Impossible de charger les événements."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        hotelId,
        canView,
        loadingViewPermission,
        range.start,
        range.end,
      ]
    );


  useEffect(() => {
    void refresh();
  }, [
    refresh,
  ]);


  useEffect(() => {
    if (
      !hotelId ||
      !canManage
    ) {
      setDepartments(
        []
      );

      return;
    }


    const currentHotelId =
      hotelId;

    let cancelled =
      false;


    async function loadDepartments() {
      try {
        const rows =
          await getEventDepartments(
            currentHotelId
          );


        if (
          !cancelled
        ) {
          setDepartments(
            rows
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Erreur services événements :",
          err
        );
      }
    }


    void loadDepartments();


    return () => {
      cancelled =
        true;
    };
  }, [
    hotelId,
    canManage,
  ]);


  function previousMonth() {
    setCurrentMonth(
      (
        current
      ) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  }


  function nextMonth() {
    setCurrentMonth(
      (
        current
      ) =>
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


  async function addEvent(
    values: {
      title: string;
      description?: string;
      location?: string;

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
    }
  ) {
    if (
      !hotelId ||
      !canManage
    ) {
      return;
    }


    try {
      setError(
        null
      );


      const created =
        await createEvent({
          hotelId,
          ...values,
        });


      await refresh();


      return created;
    } catch (
      err
    ) {
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

    values:
      Parameters<
        typeof updateEvent
      >[1]
  ) {
    if (
      !canManage
    ) {
      return;
    }


    try {
      setError(
        null
      );


      const updated =
        await updateEvent(
          id,
          values
        );


      await refresh();


      return updated;
    } catch (
      err
    ) {
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
    if (
      !canManage
    ) {
      return;
    }


    try {
      setError(
        null
      );


      await deleteEvent(
        id
      );


      setEvents(
        (
          previous
        ) =>
          previous.filter(
            (
              event
            ) =>
              event.id !==
              id
          )
      );
    } catch (
      err
    ) {
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
    departments,

    loading,
    error,

    canView,
    canManage,

    loadingPermissions:
      loadingViewPermission ||
      loadingManagePermission,

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