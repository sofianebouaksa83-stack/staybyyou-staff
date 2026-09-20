import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createDepartment,
  getHotelDepartments,
  updateDepartment,
} from "../services/services.service";

import type {
  StaffDepartment,
} from "../types/services.types";

export function useServices(
  hotelId: string | null
) {
  const [
    services,
    setServices,
  ] = useState<StaffDepartment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setServices([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getHotelDepartments(
            hotelId
          );

        setServices(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les services."
        );
      } finally {
        setLoading(false);
      }
    }, [hotelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addService =
    useCallback(
      async (name: string) => {
        if (!hotelId) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }

        setError(null);
        setSuccess(null);

        try {
          await createDepartment(
            hotelId,
            name
          );

          setSuccess(
            "Service créé."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de créer le service.";

          setError(message);
          throw err;
        }
      },
      [
        hotelId,
        refresh,
      ]
    );

  const saveService =
    useCallback(
      async (
        departmentId: string,
        name: string,
        active: boolean
      ) => {
        if (!hotelId) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }

        setError(null);
        setSuccess(null);

        try {
          await updateDepartment(
            hotelId,
            departmentId,
            name,
            active
          );

          setSuccess(
            "Service mis à jour."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de modifier le service.";

          setError(message);
          throw err;
        }
      },
      [
        hotelId,
        refresh,
      ]
    );

  return {
    services,
    loading,
    error,
    success,
    refresh,
    addService,
    saveService,
  };
}