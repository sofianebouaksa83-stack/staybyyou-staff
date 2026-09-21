import {
  Check,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";

import type {
  InstructionShift,
  StaffInstruction,
} from "../../services/instructionsService";


type Props = {
  instruction:
    StaffInstruction;

  read:
    boolean;

  canManage:
    boolean;

  onRead:
    () => void;

  onEdit:
    () => void;

  onDelete:
    () => void;

  onTogglePin:
    () => void;
};


function shiftLabel(
  shift:
    InstructionShift
) {
  switch (
    shift
  ) {
    case "morning":
      return "Matin";

    case "day":
      return "Jour";

    case "evening":
      return "Soir";

    case "night":
      return "Nuit";

    default:
      return "Toute la journée";
  }
}


export function InstructionCard({
  instruction,
  read,
  canManage,
  onRead,
  onEdit,
  onDelete,
  onTogglePin,
}: Props) {
  return (
    <article
      className={
        `instruction-card ${
          read
            ? "instruction-card-read"
            : ""
        }`
      }
    >
      <div className="instruction-card-top">
        <div className="instruction-card-tags">
          <span
            className={
              `instruction-priority ${instruction.priority}`
            }
          >
            {instruction.priority ===
            "urgent"
              ? "Urgent"
              : instruction.priority ===
                "high"
              ? "Priorité haute"
              : "Normal"}
          </span>


          <span className="instruction-shift">
            {shiftLabel(
              instruction.shift
            )}
          </span>


          {instruction.department && (
            <span className="instruction-target">
              {
                instruction.department.name
              }
            </span>
          )}


          {instruction.pinned && (
            <span className="instruction-pinned">
              <Pin
                size={11}
              />

              Épinglée
            </span>
          )}
        </div>


        {read && (
          <span className="instruction-read-state">
            <Check
              size={12}
            />

            Lu
          </span>
        )}
      </div>


      <div className="instruction-card-content">
        <h3>
          {
            instruction.title
          }
        </h3>

        <p>
          {
            instruction.content
          }
        </p>
      </div>


      <div className="instruction-card-actions">
        {!read && (
          <button
            type="button"
            className="instruction-action-button"

            onClick={
              onRead
            }
          >
            <Check
              size={13}
            />

            Marquer comme lu
          </button>
        )}


        {canManage && (
          <>
            <button
              type="button"
              className="instruction-icon-button"

              onClick={
                onEdit
              }

              title="Modifier"
            >
              <Pencil
                size={14}
              />
            </button>


            <button
              type="button"
              className="instruction-icon-button"

              onClick={
                onTogglePin
              }

              title={
                instruction.pinned
                  ? "Désépingler"
                  : "Épingler"
              }
            >
              <Pin
                size={14}
              />
            </button>


            <button
              type="button"
              className="instruction-icon-button danger"

              onClick={
                onDelete
              }

              title="Supprimer"
            >
              <Trash2
                size={14}
              />
            </button>
          </>
        )}
      </div>
    </article>
  );
}