import {
  useEffect,
  useState,
} from "react";

import {
  Pin,
  Plus,
  X,
} from "lucide-react";

import type {
  InstructionPriority,
  InstructionShift,
} from "../../services/instructionsService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    content: string;
    shift: InstructionShift;
    priority: InstructionPriority;
    pinned: boolean;
  }) => Promise<void>;
};

export function InstructionModal({
  open,
  onClose,
  onSubmit,
}: Props) {
  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [shift, setShift] =
    useState<InstructionShift>(
      "all"
    );

  const [priority, setPriority] =
    useState<InstructionPriority>(
      "normal"
    );

  const [pinned, setPinned] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle("");
    setContent("");
    setShift("all");
    setPriority("normal");
    setPinned(false);
  }, [open]);

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
      setSaving(true);

      await onSubmit({
        title:
          title.trim(),
        content:
          content.trim(),
        shift,
        priority,
        pinned,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="instruction-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="instruction-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="instruction-modal-header">
          <div>
            <span className="eyebrow">
              NOUVELLE CONSIGNE
            </span>

            <h2>
              Ajouter une consigne
            </h2>

            <p>
              Une information importante
              à transmettre entre les
              équipes.
            </p>
          </div>

          <button
            type="button"
            className="instruction-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="instruction-modal-body">
          <label className="instruction-form-field">
            <span>Titre</span>

            <input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Ex. Climatisation salle de sport"
            />
          </label>

          <label className="instruction-form-field">
            <span>Consigne</span>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder="Ajoutez les informations utiles…"
              rows={5}
            />
          </label>

          <div className="instruction-form-grid">
            <label className="instruction-form-field">
              <span>Période</span>

              <select
                value={shift}
                onChange={(event) =>
                  setShift(
                    event.target
                      .value as InstructionShift
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
              <span>Priorité</span>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as InstructionPriority
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
            className={`instruction-pin-toggle ${
              pinned ? "active" : ""
            }`}
            onClick={() =>
              setPinned(
                (value) =>
                  !value
              )
            }
          >
            <Pin size={14} />

            {pinned
              ? "Consigne épinglée"
              : "Épingler cette consigne"}
          </button>
        </div>

        <footer className="instruction-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
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
            <Plus size={15} />

            {saving
              ? "Création…"
              : "Créer la consigne"}
          </button>
        </footer>
      </div>
    </div>
  );
}