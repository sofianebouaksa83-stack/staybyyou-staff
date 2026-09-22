import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveRoomServiceOrders,
  isRoomServiceOrderLate,
  type RoomServiceOrderWidgetRow,
} from "./roomServiceWidget.service";

export function useRoomServiceWidgetsData(
  hotelId: string | null,
  enabled: boolean
) {
  const [
    orders,
    setOrders,
  ] = useState<
    RoomServiceOrderWidgetRow[]
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
        setOrders([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rows =
          await getActiveRoomServiceOrders(
            hotelId
          );

        if (active) {
          setOrders(rows);
        }
      } catch (loadError) {
        console.error(
          "Erreur commandes widget :",
          loadError
        );

        if (active) {
          setError(
            "Impossible de charger les commandes."
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
  ]);

  const lateOrders =
    useMemo(
      () =>
        orders.filter(
          (order) =>
            isRoomServiceOrderLate(
              order
            )
        ),
      [orders]
    );

  return {
    orders,
    lateOrders,
    loading,
    error,
  };
}
