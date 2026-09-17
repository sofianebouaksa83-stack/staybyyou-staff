import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "../../components/ui/PageHeader";
import { InstructionCard } from "./InstructionCard";
import { InstructionModal } from "./InstructionModal";
import { useInstructions } from "./useInstructions";

import type {
  InstructionShift,
} from "../../services/instructionsService";

const filters: {
  value: "all" | InstructionShift;
  label: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: "morning", label: "Matin" },
  { value: "day", label: "Jour" },
  { value: "evening", label: "Soir" },
  { value: "night", label: "Nuit" },
];

export function InstructionsBoard() {
  const {
    instructions,
    loading,
    error,
    canManage,
    addInstruction,
    editInstruction,
    removeInstruction,
    markAsRead,
    isRead,
  } = useInstructions();

  const [filter, setFilter] =
    useState<"all" | InstructionShift>(
      "all"
    );

  const [modalOpen, setModalOpen] =
    useState(false);

  const filteredInstructions =
    useMemo(() => {
      if (filter === "all") {
        return instructions;
      }

      return instructions.filter(
        (instruction) =>
          instruction.shift === filter ||
          instruction.shift === "all"
      );
    }, [instructions, filter]);

  return (
    <>
      <PageHeader
        title="Consignes"
        subtitle="Les informations importantes à transmettre entre les services."
        action={
          canManage ? (
            <button
              className="primary-button small-button"
              onClick={() =>
                setModalOpen(true)
              }
            >
              <Plus size={16} />
              Nouvelle consigne
            </button>
          ) : undefined
        }
      />

      <div className="instruction-filters">
        {filters.map((item) => (
          <button
            key={item.value}
            className={
              filter === item.value
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(item.value)
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="instruction-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="instruction-empty">
          Chargement des consignes…
        </div>
      ) : filteredInstructions.length === 0 ? (
        <div className="instruction-empty">
          Aucune consigne pour cette période.
        </div>
      ) : (
        <div className="instructions-grid">
          {filteredInstructions.map(
            (instruction) => (
              <InstructionCard
                key={instruction.id}
                instruction={instruction}
                read={isRead(
                  instruction.id
                )}
                canManage={canManage}
                onRead={() =>
                  markAsRead(
                    instruction.id
                  )
                }
                onTogglePin={() =>
                  editInstruction(
                    instruction.id,
                    {
                      pinned:
                        !instruction.pinned,
                    }
                  )
                }
                onDelete={() => {
                  if (
                    window.confirm(
                      "Supprimer cette consigne ?"
                    )
                  ) {
                    removeInstruction(
                      instruction.id
                    );
                  }
                }}
              />
            )
          )}
        </div>
      )}

      <InstructionModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSubmit={async (values) => {
          await addInstruction(
            values
          );
        }}
      />
    </>
  );
}