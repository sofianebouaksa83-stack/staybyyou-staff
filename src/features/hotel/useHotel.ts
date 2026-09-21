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
  getHotelStays,
  type HotelStay,
} from "../../services/hotelService";


function startOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function endOfDay(
  date: Date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1
  );
}


function sameDay(
  a: Date,
  b: Date
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}


export function useHotel() {
  const {
    hotelId,
    selectedDate,
  } = useApp();


  const {
    allowed:
      canViewHotel,

    loading:
      loadingViewPermission,
  } = useHotelPermission(
    hotelId,
    "hotel.view"
  );


  const {
    allowed:
      canManageStays,

    loading:
      loadingStayPermission,
  } = useHotelPermission(
    hotelId,
    "hotel.stays.manage"
  );


  const {
    allowed:
      canManageFollowups,

    loading:
      loadingFollowupPermission,
  } = useHotelPermission(
    hotelId,
    "hotel.followups.manage"
  );


  const [
    stays,
    setStays,
  ] =
    useState<
      HotelStay[]
    >([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


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
          !canViewHotel
        ) {
          setStays(
            []
          );

          setLoading(
            false
          );

          setError(
            null
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


          const start =
            startOfDay(
              selectedDate
            );

          const end =
            endOfDay(
              selectedDate
            );


          const rows =
            await getHotelStays(
              hotelId,
              start.toISOString(),
              end.toISOString()
            );


          setStays(
            rows
          );
        } catch (
          err
        ) {
          console.error(
            "Erreur séjours :",
            err
          );

          setError(
            "Impossible de charger les séjours."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        hotelId,
        selectedDate,
        canViewHotel,
        loadingViewPermission,
      ]
    );


  useEffect(() => {
    void refresh();
  }, [
    refresh,
  ]);


  const arrivals =
    useMemo(
      () =>
        stays.filter(
          (
            stay
          ) =>
            sameDay(
              new Date(
                stay.starts_at
              ),
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
          (
            stay
          ) =>
            sameDay(
              new Date(
                stay.ends_at
              ),
              selectedDate
            )
        ),
      [
        stays,
        selectedDate,
      ]
    );


  const inHouse =
    useMemo(
      () =>
        stays.filter(
          (
            stay
          ) => {
            if (
              !stay.active
            ) {
              return false;
            }


            const start =
              new Date(
                stay.starts_at
              );

            const end =
              new Date(
                stay.ends_at
              );


            return (
              start <
                endOfDay(
                  selectedDate
                ) &&
              end >
                startOfDay(
                  selectedDate
                )
            );
          }
        ),
      [
        stays,
        selectedDate,
      ]
    );


  return {
    stays,

    arrivals,
    inHouse,
    departures,

    canViewHotel,
    canManageStays,
    canManageFollowups,

    loadingPermissions:
      loadingViewPermission ||
      loadingStayPermission ||
      loadingFollowupPermission,

    loading,
    error,

    refresh,
  };
}