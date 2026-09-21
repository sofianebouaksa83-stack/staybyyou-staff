import {
  useEffect,
  useState,
} from "react";

import { useApp } from "../../../app/AppContext";

import {
  getClientStays,
} from "../services/clients.service";

import type {
  ClientStay,
} from "../types/clients.types";

export function useClients() {
  const {
    hotelId,
  } = useApp();

  const [
    clients,
    setClients,
  ] = useState<ClientStay[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      if (!hotelId) {
        setClients([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rows =
          await getClientStays(
            hotelId
          );

        if (!cancelled) {
          setClients(rows);
        }
      } catch (err) {
        console.error(
          "Erreur clients :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger les clients."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  return {
    clients,
    loading,
    error,
  };
}