import {
  useCallback,
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

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setPermissions(
          new Set()
        );
        setLoading(false);
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
    }, [hotelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function handleFocus() {
      void refresh();
    }

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [refresh]);

  return {
    permissions,
    loading,
    refresh,
    can:
      (permission: string) =>
        permissions.has(
          permission
        ),
  };
}
