import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useApp } from "../../app/AppContext";
import { useHotelPermission } from "../permissions/hooks/useHotelPermission";

import {
  createInstruction,
  deleteInstruction,
  getInstructions,
  getReadInstructionIds,
  markInstructionAsRead,
  updateInstruction,
  type InstructionPriority,
  type InstructionShift,
  type StaffInstruction,
} from "../../services/instructionsService";

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useInstructions() {
  const {
    hotelId,
    selectedDate,
  } = useApp();

  const [
    instructions,
    setInstructions,
  ] = useState<StaffInstruction[]>([]);

  const [
    readIds,
    setReadIds,
  ] = useState<string[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const {
    allowed: canManage,
  } = useHotelPermission(
    hotelId,
    "instructions.manage"
  );

  const dateKey =
    formatDateKey(selectedDate);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setInstructions([]);
        setReadIds([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const rows =
          await getInstructions(
            hotelId,
            dateKey
          );

        setInstructions(rows);

        const ids =
          await getReadInstructionIds(
            rows.map(
              (instruction) =>
                instruction.id
            )
          );

        setReadIds(ids);
      } catch (err) {
        console.error(
          "Erreur consignes :",
          err
        );

        setError(
          "Impossible de charger les consignes."
        );
      } finally {
        setLoading(false);
      }
    }, [
      hotelId,
      dateKey,
    ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addInstruction(values: {
    title: string;
    content: string;
    shift: InstructionShift;
    priority: InstructionPriority;
    departmentId?: string | null;
    pinned?: boolean;
  }) {
    if (!hotelId || !canManage) {
      return;
    }

    try {
      setError(null);

      const created =
        await createInstruction({
          hotelId,
          date: dateKey,
          ...values,
        });

      setInstructions(
        (previous) =>
          [...previous, created].sort(
            (a, b) =>
              Number(b.pinned) -
                Number(a.pinned) ||
              new Date(
                a.created_at
              ).getTime() -
                new Date(
                  b.created_at
                ).getTime()
          )
      );

      return created;
    } catch (err) {
      console.error(
        "Erreur création consigne :",
        err
      );

      setError(
        "Impossible de créer la consigne."
      );

      throw err;
    }
  }

  async function editInstruction(
    id: string,
    values: Partial<{
      title: string;
      content: string;
      shift: InstructionShift;
      priority: InstructionPriority;
      pinned: boolean;
      active: boolean;
      department_id: string | null;
    }>
  ) {
    if (!canManage) {
      return;
    }
    
    try {
      setError(null);

      const updated =
        await updateInstruction(
          id,
          values
        );

      setInstructions(
        (previous) =>
          previous.map(
            (instruction) =>
              instruction.id === id
                ? updated
                : instruction
          )
      );

      return updated;
    } catch (err) {
      console.error(
        "Erreur modification consigne :",
        err
      );

      setError(
        "Impossible de modifier la consigne."
      );

      throw err;
    }
  }

  async function removeInstruction(
    id: string
  ) {
    if (!canManage) {
      return;
    }
    
    try {
      setError(null);

      await deleteInstruction(id);

      setInstructions(
        (previous) =>
          previous.filter(
            (instruction) =>
              instruction.id !== id
          )
      );
    } catch (err) {
      console.error(
        "Erreur suppression consigne :",
        err
      );

      setError(
        "Impossible de supprimer la consigne."
      );

      throw err;
    }
  }

  async function markAsRead(
    id: string
  ) {
    if (readIds.includes(id)) {
      return;
    }

    try {
      await markInstructionAsRead(
        id
      );

      setReadIds(
        (previous) => [
          ...previous,
          id,
        ]
      );
    } catch (err) {
      console.error(
        "Erreur lecture consigne :",
        err
      );
    }
  }

  function isRead(id: string) {
    return readIds.includes(id);
  }

  return {
    instructions,
    loading,
    error,

    canManage,

    selectedDate,
    dateKey,

    refresh,

    addInstruction,
    editInstruction,
    removeInstruction,

    markAsRead,
    isRead,
  };
}