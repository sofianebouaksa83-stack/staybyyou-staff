import {
  useEffect,
  useState,
} from "react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  searchHotel,
  type GlobalSearchResults,
} from "../services/search.service";

const EMPTY_RESULTS: GlobalSearchResults = {
  clients: [],
  tasks: [],
  messages: [],
};

export function useGlobalSearch(
  query: string
) {
  const {
    hotelId,
  } = useApp();

  const [
    results,
    setResults,
  ] =
    useState<GlobalSearchResults>(
      EMPTY_RESULTS
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    const normalized =
      query.trim();

    if (
      !hotelId ||
      normalized.length < 2
    ) {
      setResults(
        EMPTY_RESULTS
      );

      setLoading(
        false
      );

      setError(
        null
      );

      return;
    }

    let cancelled =
      false;

    const timeout =
      window.setTimeout(
        async () => {
          try {
            setLoading(
              true
            );

            setError(
              null
            );

            const nextResults =
              await searchHotel(
                hotelId,
                normalized
              );

            if (
              !cancelled
            ) {
              setResults(
                nextResults
              );
            }
          } catch (err) {
            console.error(
              "Erreur recherche globale :",
              err
            );

            if (
              !cancelled
            ) {
              setResults(
                EMPTY_RESULTS
              );

              setError(
                "Impossible d'effectuer la recherche."
              );
            }
          } finally {
            if (
              !cancelled
            ) {
              setLoading(
                false
              );
            }
          }
        },
        250
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timeout
      );
    };
  }, [
    hotelId,
    query,
  ]);

  return {
    results,
    loading,
    error,
  };
}