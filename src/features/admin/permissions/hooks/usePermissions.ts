import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getRolePermissions,
} from "../services/permissions.service";

import type {
  RolePermission,
} from "../types/permissions.types";

export function usePermissions(
  hotelId: string | null
) {
  const [
    permissions,
    setPermissions,
  ] = useState<RolePermission[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getRolePermissions(
            hotelId
          );

        setPermissions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les permissions."
        );
      } finally {
        setLoading(false);
      }
    }, [hotelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    permissions,
    loading,
    error,
    refresh,
  };
}