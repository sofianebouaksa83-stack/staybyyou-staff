import {
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "../../../services/supabase";

type PermissionRow = {
  permission_key: string;
};

export function useWidgetPermissions(
  hotelId: string | null
) {
  const [
    permissions,
    setPermissions,
  ] = useState<Set<string>>(
    () => new Set()
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hotelId) {
        if (active) {
          setPermissions(
            new Set()
          );
          setLoading(false);
        }

        return;
      }

      setLoading(true);

      const {
        data,
        error,
      } = await supabase.rpc(
        "get_my_hotel_permissions",
        {
          p_hotel_id:
            hotelId,
        }
      );

      if (!active) {
        return;
      }

      if (error) {
        console.error(
          "Erreur permissions widgets :",
          error
        );

        setPermissions(
          new Set()
        );
        setLoading(false);
        return;
      }

      setPermissions(
        new Set(
          (
            (data ?? []) as PermissionRow[]
          ).map(
            (row) =>
              row.permission_key
          )
        )
      );

      setLoading(false);
    }

    void load();

    return () => {
      active = false;
    };
  }, [hotelId]);

  return {
    permissions,
    loading,
    can:
      (permission: string) =>
        permissions.has(
          permission
        ),
  };
}
