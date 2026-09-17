import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import type {
  TaskPriority,
} from "../../services/tasksService";

import {
  formatTaskDateKey,
} from "./useTasks";

type TaskFormValues = {
  title: string;
  description: string;
  date: string;
  time: string;
  priority: TaskPriority;
};

type Props = {
  open: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSubmit: (
    values: TaskFormValues
  ) => Promise<void> | void;
};

export function TaskModal({
  open,
  selectedDate,
  onClose,
  onSubmit,
}: Props) {
  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    taskDate,
    setTaskDate,
  ] = useState(
    formatTaskDateKey(
      selectedDate
    )
  );

  const [
    taskTime,
    setTaskTime,
  ] = useState("09:00");

  const [
    priority,
    setPriority,
  ] = useState<TaskPriority>(
    "normal"
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle("");
    setDescription("");

    setTaskDate(
      formatTaskDateKey(
        selectedDate
      )
    );

    setTaskTime("09:00");
    setPriority("normal");
  }, [
    open,
    selectedDate,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (
      !title.trim() ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        title,
        description,
        date: taskDate,
        time: taskTime,
        priority,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="task-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="task-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="task-modal-header">
          <div>
            <span className="eyebrow">
              NOUVELLE TÂCHE
            </span>

            <h2>
              Créer une tâche
            </h2>

            <p>
              Ajoutez les informations
              nécessaires pour organiser
              le travail de l'équipe.
            </p>
          </div>

          <button
            type="button"
            className="task-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={19} />
          </button>
        </header>

        <div className="task-modal-body">
          <label className="task-form-field">
            <span>
              Titre
            </span>

            <input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Ex. Vérifier la climatisation"
            />
          </label>

          <label className="task-form-field">
            <span>
              Description
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Informations complémentaires..."
            />
          </label>

          <div className="task-form-grid">
            <label className="task-form-field">
              <span>
                Date
              </span>

              <input
                type="date"
                value={taskDate}
                onChange={(event) =>
                  setTaskDate(
                    event.target.value
                  )
                }
              />
            </label>

            <label className="task-form-field">
              <span>
                Heure
              </span>

              <input
                type="time"
                value={taskTime}
                onChange={(event) =>
                  setTaskTime(
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <label className="task-form-field">
            <span>Priorité</span>

            <select
                value={priority}
                onChange={(event) =>
                setPriority(
                    event.target.value as TaskPriority
                )
                }
            >
                <option value="normal">
                Normale
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

        <footer className="task-modal-footer">
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
            onClick={
              handleSubmit
            }
            disabled={
              saving ||
              !title.trim()
            }
          >
            {saving
              ? "Création…"
              : "Créer la tâche"}
          </button>
        </footer>
      </div>
    </div>
  );
}