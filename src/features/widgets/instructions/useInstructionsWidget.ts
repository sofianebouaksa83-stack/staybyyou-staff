import {
  useEffect,
  useState,
} from "react";

import {
  useApp,
} from "../../../app/AppContext";
import {
  getInstructions,
  type StaffInstruction,
} from "../../../services/instructionsService";

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

export function useInstructionsWidget() {
  const {
    hotelId,
    selectedDate,
  } = useApp();

  const [
    instructions,
    setInstructions,
  ] = useState<
    StaffInstruction[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (!hotelId) {
        setInstructions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rows =
          await getInstructions(
            hotelId,
            formatDateKey(
              selectedDate
            )
          );

        if (active) {
          setInstructions(
            rows
          );
        }
      } catch (loadError) {
        console.error(
          "Erreur consignes widget :",
          loadError
        );

        if (active) {
          setError(
            "Impossible de charger les consignes."
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
    hotelId,
    selectedDate,
  ]);

  return {
    instructions,
    loading,
    error,
  };
}
