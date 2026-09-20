import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getHotelSettings,
  updateHotelSettings,
} from "../services/hotel-settings.service";

import type {
  HotelSettings,
  UpdateHotelSettingsInput,
} from "../types/hotel-settings.types";

export function useHotelSettings(
  hotelId: string | null,
  userId?: string
) {
  const [
    settings,
    setSettings,
  ] =
    useState<HotelSettings | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(null);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setSettings(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getHotelSettings(
            hotelId
          );

        setSettings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les paramètres."
        );
      } finally {
        setLoading(false);
      }
    }, [hotelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save =
    useCallback(
      async (
        input: UpdateHotelSettingsInput
      ) => {
        if (
          !hotelId ||
          !userId
        ) {
          throw new Error(
            "Utilisateur ou établissement introuvable."
          );
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
          await updateHotelSettings(
            hotelId,
            userId,
            input
          );

          setSuccess(
            "Paramètres de l'établissement mis à jour."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible d'enregistrer les paramètres.";

          setError(message);

          throw err;
        } finally {
          setSaving(false);
        }
      },
      [
        hotelId,
        userId,
        refresh,
      ]
    );

  return {
    settings,
    loading,
    saving,
    error,
    success,
    refresh,
    save,
  };
}