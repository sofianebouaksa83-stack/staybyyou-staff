import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFnbDaily,
  getFnbServices,
  type FnbDailyRow,
  type FnbServiceRow,
} from "../../../services/fnbService";

function formatDateKey(
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

export function useFnbSummaryWidgetData(
  hotelId: string | null,
  selectedDate: Date,
  enabled: boolean
) {
  const [
    services,
    setServices,
  ] = useState<
    FnbServiceRow[]
  >([]);

  const [
    daily,
    setDaily,
  ] = useState<
    FnbDailyRow[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (
        !enabled ||
        !hotelId
      ) {
        setServices([]);
        setDaily([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [
          serviceRows,
          dailyRows,
        ] = await Promise.all([
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

        if (active) {
          setServices(
            serviceRows
          );
          setDaily(
            dailyRows
          );
        }
      } catch (loadError) {
        console.error(
          "Erreur résumé F&B widget :",
          loadError
        );

        if (active) {
          setError(
            "Impossible de charger le résumé F&B."
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
    enabled,
    hotelId,
    selectedDate,
  ]);

  const summary =
    useMemo(() => {
      const dailyByService =
        new Map(
          daily.map(
            (row) => [
              row.service_id,
              row,
            ]
          )
        );

      return services.reduce(
        (
          result,
          service
        ) => {
          const row =
            dailyByService.get(
              service.id
            );

          result.reservations +=
            row?.reservations ??
            0;

          result.capacity +=
            row?.capacity ??
            service.default_capacity ??
            0;

          return result;
        },
        {
          reservations: 0,
          capacity: 0,
        }
      );
    }, [
      daily,
      services,
    ]);

  return {
    ...summary,
    loading,
    error,
  };
}
