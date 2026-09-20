import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../../../services/supabase";

export function useHotelPermission(
  hotelId: string | null,
  permission: string
) {
  const [
    allowed,
    setAllowed,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkPermission() {
      if (!hotelId) {
        if (active) {
          setAllowed(false);
          setLoading(false);
        }

        return;
      }

      setLoading(true);

      const {
        data,
        error,
      } = await supabase.rpc(
        "has_hotel_permission",
        {
          p_hotel_id:
            hotelId,
          p_permission:
            permission,
        }
      );

      if (!active) {
        return;
      }

      if (error) {
        console.error(
          "Permission error:",
          error
        );

        setAllowed(false);
        setLoading(false);

        return;
      }

      setAllowed(
        data === true
      );

      setLoading(false);
    }

    void checkPermission();

    return () => {
      active = false;
    };
  }, [
    hotelId,
    permission,
  ]);

  return {
    allowed,
    loading,
  };
}