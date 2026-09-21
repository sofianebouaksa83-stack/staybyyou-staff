import {
  useEffect,
  useState,
} from "react";

import {
  Pin,
  Plus,
  Save,
  X,
} from "lucide-react";

import type {
  InstructionDepartment,
  InstructionPriority,
  InstructionShift,
  StaffInstruction,
} from "../../services/instructionsService";


type Props = {
  open:
    boolean;

  instruction?:
    StaffInstruction | null;

  departments:
    InstructionDepartment[];

  onClose:
    () => void;

  onSubmit: (
    values: {
      title: string;
      content: string;

      shift:
        InstructionShift;

      priority:
        InstructionPriority;

      departmentId:
        string | null;

      pinned:
        boolean;
    }
  ) => Promise<void>;
};


export function InstructionModal({
  open,
  instruction,
  departments,
  onClose,
  onSubmit,
}: Props) {
  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    content,
    setContent,
  ] =
    useState("");

  const [
    shift,
    setShift,
  ] =
    useState<InstructionShift>(
      "all"
    );

  const [
    priority,
    setPriority,
  ] =
    useState<InstructionPriority>(
      "normal"
    );

  const [
    departmentId,
    setDepartmentId,
  ] =
    useState("");

  const [
    pinned,
    setPinned,
  ] =
    useState(
      false
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const isEditing =
    Boolean(
      instruction
    );


  useEffect(() => {
    if (!open) {
      return;
    }


    if (
      instruction
    ) {
      setTitle(
        instruction.title
      );

      setContent(
        instruction.content
      );

      setShift(
        instruction.shift
      );

      setPriority(
        instruction.priority
      );

      setDepartmentId(
        instruction.department_id ??
          ""
      );

      setPinned(
        instruction.pinned
      );

      return;
    }


    setTitle(
      ""
    );

    setContent(
      ""
    );

    setShift(
      "all"
    );

    setPriority(
      "normal"
    );

    setDepartmentId(
      ""
    );

    setPinned(
      false
    );
  }, [
    open,
    instruction,
  ]);


  if (!open) {
    return null;
  }


  async function handleSubmit() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      return;
    }


    try {
      setSaving(
        true
      );


      await onSubmit({
        title:
          title.trim(),

        content:
          content.trim(),

        shift,

        priority,

        departmentId:
          departmentId ||
          null,

        pinned,
      });


      onClose();
    } finally {
      setSaving(
        false
      );
    }
  }


  return (
    <div
      className="instruction-modal-backdrop"

      onClick={() => {
        if (
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div
        className="instruction-modal"

        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="instruction-modal-header">
          <div>
            <span className="eyebrow">
              {isEditing
                ? "MODIFIER LA CONSIGNE"
                : "NOUVELLE CONSIGNE"}
            </span>

            <h2>
              {isEditing
                ? "Modifier la consigne"
                : "Ajouter une consigne"}
            </h2>

            <p>
              Une information importante
              à transmettre entre les équipes.
            </p>
          </div>


          <button
            type="button"
            className="instruction-modal-close"

            onClick={
              onClose
            }

            disabled={
              saving
            }
          >
            <X
              size={18}
            />
          </button>
        </header>


        <div className="instruction-modal-body">
          <label className="instruction-form-field">
            <span>
              Titre
            </span>

            <input
              autoFocus

              value={
                title
              }

              onChange={(
                event
              ) =>
                setTitle(
                  event.target.value
                )
              }

              placeholder="Ex. Climatisation salle de sport"
            />
          </label>


          <label className="instruction-form-field">
            <span>
              Consigne
            </span>

            <textarea
              value={
                content
              }

              onChange={(
                event
              ) =>
                setContent(
                  event.target.value
                )
              }

              placeholder="Ajoutez les informations utiles…"

              rows={
                5
              }
            />
          </label>


          <label className="instruction-form-field">
            <span>
              Service concerné
            </span>

            <select
              value={
                departmentId
              }

              onChange={(
                event
              ) =>
                setDepartmentId(
                  event.target.value
                )
              }
            >
              <option value="">
                Tout l’hôtel
              </option>

              {departments.map(
                (
                  department
                ) => (
                  <option
                    key={
                      department.id
                    }

                    value={
                      department.id
                    }
                  >
                    {
                      department.name
                    }
                  </option>
                )
              )}
            </select>
          </label>


          <div className="instruction-form-grid">
            <label className="instruction-form-field">
              <span>
                Période
              </span>

              <select
                value={
                  shift
                }

                onChange={(
                  event
                ) =>
                  setShift(
                    event.target
                      .value as
                      InstructionShift
                  )
                }
              >
                <option value="all">
                  Toute la journée
                </option>

                <option value="morning">
                  Matin
                </option>

                <option value="day">
                  Jour
                </option>

                <option value="evening">
                  Soir
                </option>

                <option value="night">
                  Nuit
                </option>
              </select>
            </label>


            <label className="instruction-form-field">
              <span>
                Priorité
              </span>

              <select
                value={
                  priority
                }

                onChange={(
                  event
                ) =>
                  setPriority(
                    event.target
                      .value as
                      InstructionPriority
                  )
                }
              >
                <option value="normal">
                  Normal
                </option>

                <option value="high">
                  Haute
                </option>

                <option value="urgent">
                  Urgente
                </option>
              </select>
            </label>
          </div>


          <button
            type="button"

            className={
              `instruction-pin-toggle ${
                pinned
                  ? "active"
                  : ""
              }`
            }

            onClick={() =>
              setPinned(
                (
                  value
                ) =>
                  !value
              )
            }
          >
            <Pin
              size={14}
            />

            {pinned
              ? "Consigne épinglée"
              : "Épingler cette consigne"}
          </button>
        </div>


        <footer className="instruction-modal-footer">
          <button
            type="button"
            className="secondary-button"

            onClick={
              onClose
            }

            disabled={
              saving
            }
          >
            Annuler
          </button>


          <button
            type="button"
            className="primary-button"

            disabled={
              saving ||
              !title.trim() ||
              !content.trim()
            }

            onClick={
              handleSubmit
            }
          >
            {isEditing ? (
              <Save
                size={15}
              />
            ) : (
              <Plus
                size={15}
              />
            )}

            {saving
              ? "Enregistrement…"
              : isEditing
              ? "Enregistrer"
              : "Créer la consigne"}
          </button>
        </footer>
      </div>
    </div>
  );
}