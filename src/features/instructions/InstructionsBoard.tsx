import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
} from "lucide-react";

import {
  PageHeader,
} from "../../components/ui/PageHeader";

import type {
  InstructionShift,
  StaffInstruction,
} from "../../services/instructionsService";

import {
  InstructionCard,
} from "./InstructionCard";

import {
  InstructionModal,
} from "./InstructionModal";

import {
  useInstructions,
} from "./useInstructions";


const filters: {
  value:
    "all" |
    InstructionShift;

  label:
    string;
}[] = [
  {
    value:
      "all",

    label:
      "Toutes",
  },

  {
    value:
      "morning",

    label:
      "Matin",
  },

  {
    value:
      "day",

    label:
      "Jour",
  },

  {
    value:
      "evening",

    label:
      "Soir",
  },

  {
    value:
      "night",

    label:
      "Nuit",
  },
];


export function InstructionsBoard() {
  const {
    instructions,
    departments,

    loading,
    error,

    canView,
    canManage,

    loadingPermissions,

    addInstruction,
    editInstruction,
    removeInstruction,

    markAsRead,
    isRead,
  } =
    useInstructions();


  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" |
      InstructionShift
    >(
      "all"
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(
      false
    );


  const [
    editingInstruction,
    setEditingInstruction,
  ] =
    useState<
      StaffInstruction | null
    >(
      null
    );


  const filteredInstructions =
    useMemo(() => {
      if (
        filter ===
        "all"
      ) {
        return instructions;
      }


      return instructions.filter(
        (
          instruction
        ) =>
          instruction.shift ===
            filter ||
          instruction.shift ===
            "all"
      );
    }, [
      instructions,
      filter,
    ]);


  if (
    loadingPermissions
  ) {
    return (
      <>
        <PageHeader
          title="Consignes"

          subtitle="Les informations importantes à transmettre entre les services."
        />

        <div className="instruction-empty">
          Vérification des permissions…
        </div>
      </>
    );
  }


  if (
    !canView
  ) {
    return (
      <>
        <PageHeader
          title="Consignes"

          subtitle="Les informations importantes à transmettre entre les services."
        />

        <div className="instruction-empty">
          Vous n’avez pas accès aux consignes.
        </div>
      </>
    );
  }


  return (
    <>
      <PageHeader
        title="Consignes"

        subtitle="Les informations importantes à transmettre entre les services."

        action={
          canManage ? (
            <button
              type="button"
              className="primary-button small-button"

              onClick={() => {
                setEditingInstruction(
                  null
                );

                setModalOpen(
                  true
                );
              }}
            >
              <Plus
                size={16}
              />

              Nouvelle consigne
            </button>
          ) : undefined
        }
      />


      <div className="instruction-filters">
        {filters.map(
          (
            item
          ) => (
            <button
              type="button"

              key={
                item.value
              }

              className={
                filter ===
                item.value
                  ? "active"
                  : ""
              }

              onClick={() =>
                setFilter(
                  item.value
                )
              }
            >
              {
                item.label
              }
            </button>
          )
        )}
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
      ) : filteredInstructions.length ===
        0 ? (
        <div className="instruction-empty">
          Aucune consigne pour cette période.
        </div>
      ) : (
        <div className="instructions-grid">
          {filteredInstructions.map(
            (
              instruction
            ) => (
              <InstructionCard
                key={
                  instruction.id
                }

                instruction={
                  instruction
                }

                read={
                  isRead(
                    instruction.id
                  )
                }

                canManage={
                  canManage
                }

                onRead={() =>
                  void markAsRead(
                    instruction.id
                  )
                }

                onEdit={() => {
                  setEditingInstruction(
                    instruction
                  );

                  setModalOpen(
                    true
                  );
                }}

                onTogglePin={() =>
                  void editInstruction(
                    instruction.id,
                    {
                      pinned:
                        !instruction.pinned,
                    }
                  )
                }

                onDelete={() => {
                  if (
                    !canManage
                  ) {
                    return;
                  }


                  if (
                    window.confirm(
                      "Supprimer cette consigne ?"
                    )
                  ) {
                    void removeInstruction(
                      instruction.id
                    );
                  }
                }}
              />
            )
          )}
        </div>
      )}


      {canManage && (
        <InstructionModal
          open={
            modalOpen
          }

          instruction={
            editingInstruction
          }

          departments={
            departments
          }

          onClose={() => {
            setModalOpen(
              false
            );

            setEditingInstruction(
              null
            );
          }}

          onSubmit={async (
            values
          ) => {
            if (
              editingInstruction
            ) {
              await editInstruction(
                editingInstruction.id,
                {
                  title:
                    values.title,

                  content:
                    values.content,

                  shift:
                    values.shift,

                  priority:
                    values.priority,

                  department_id:
                    values.departmentId,

                  pinned:
                    values.pinned,
                }
              );
            } else {
              await addInstruction(
                values
              );
            }
          }}
        />
      )}
    </>
  );
}