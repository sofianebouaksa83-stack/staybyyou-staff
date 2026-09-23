import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFnbDaily,
  getFnbServices,
  saveFnbDaily,
} from "../../../services/fnbService";

export type FnbDashboardService = {
  id: string;

  name: string;

  startTime: string;
  endTime: string;

  reservations: number;
  capacity: number;

  order: number;
};

function formatDateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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

function cleanTime(
  value:
    string | null | undefined
) {
  return value
    ? value.slice(
        0,
        5
      )
    : "";
}

export function useFnbDashboardData(
  hotelId:
    string | null,

  selectedDate:
    Date,

  enabled:
    boolean
) {
  const [
    services,
    setServices,
  ] =
    useState<
      FnbDashboardService[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  useEffect(
    () => {
      let active =
        true;

      async function load() {
        if (
          !enabled ||
          !hotelId
        ) {
          setServices(
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

          const [
            serviceRows,
            dailyRows,
          ] =
            await Promise.all([
              getFnbServices(
                hotelId
              ),

              getFnbDaily(
                hotelId,
                formatDateKey(
                  selectedDate
                )
              ),
            ]);

          if (
            !active
          ) {
            return;
          }

          const dailyMap =
            new Map(
              dailyRows.map(
                (
                  row
                ) => [
                  row.service_id,
                  row,
                ]
              )
            );

          const next =
            serviceRows
              .map(
                (
                  service
                ): FnbDashboardService => {
                  const daily =
                    dailyMap.get(
                      service.id
                    );

                  return {
                    id:
                      service.id,

                    name:
                      service.name,

                    startTime:
                      cleanTime(
                        daily?.start_time
                      ) ||
                      cleanTime(
                        service.default_start_time
                      ),

                    endTime:
                      cleanTime(
                        daily?.end_time
                      ) ||
                      cleanTime(
                        service.default_end_time
                      ),

                    reservations:
                      daily?.reservations ??
                      0,

                    capacity:
                      daily?.capacity ??
                      service.default_capacity ??
                      0,

                    order:
                      service.sort_order,
                  };
                }
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.order -
                  b.order
              );

          setServices(
            next
          );
        } catch (
          loadError
        ) {
          console.error(
            "Erreur données F&B dashboard :",
            loadError
          );

          if (
            active
          ) {
            setError(
              "Impossible de charger les données F&B."
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      }

      void load();

      return () => {
        active =
          false;
      };
    },

    [
      enabled,
      hotelId,
      selectedDate,
    ]
  );

  const updateReservations =
    useCallback(
      async (
        serviceId:
          string,

        reservations:
          number
      ) => {
        if (
          !hotelId
        ) {
          return false;
        }

        const current =
          services.find(
            (
              service
            ) =>
              service.id ===
              serviceId
          );

        if (
          !current
        ) {
          return false;
        }

        const safeValue =
          Math.max(
            0,
            reservations
          );

        setServices(
          (
            previous
          ) =>
            previous.map(
              (
                service
              ) =>
                service.id ===
                serviceId
                  ? {
                      ...service,

                      reservations:
                        safeValue,
                    }
                  : service
            )
        );

        try {
          await saveFnbDaily({
            hotelId,

            serviceId,

            date:
              formatDateKey(
                selectedDate
              ),

            startTime:
              current.startTime ||
              null,

            endTime:
              current.endTime ||
              null,

            reservations:
              safeValue,

            capacity:
              current.capacity,
          });

          return true;
        } catch (
          saveError
        ) {
          console.error(
            "Erreur mise à jour réservations F&B :",
            saveError
          );

          setServices(
            (
              previous
            ) =>
              previous.map(
                (
                  service
                ) =>
                  service.id ===
                  serviceId
                    ? current
                    : service
              )
          );

          setError(
            "La modification F&B n'a pas pu être enregistrée."
          );

          return false;
        }
      },

      [
        hotelId,
        selectedDate,
        services,
      ]
    );

  const summary =
    useMemo(
      () =>
        services.reduce(
          (
            result,
            service
          ) => {
            result.reservations +=
              service.reservations;

            result.capacity +=
              service.capacity;

            return result;
          },

          {
            reservations:
              0,

            capacity:
              0,
          }
        ),

      [
        services,
      ]
    );

  return {
    services,

    reservations:
      summary.reservations,

    capacity:
      summary.capacity,

    loading,
    error,

    updateReservations,
  };
}