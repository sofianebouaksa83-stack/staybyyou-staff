import {
  CheckCircle2,
  Clock3,
  Trash2,
} from "lucide-react";

import type {
  StaffTask,
  TaskPriority,
  TaskStatus,
} from "../../services/tasksService";

type Props = {
  task: StaffTask;
  canEdit: boolean;

  onStatusChange: (
    task: StaffTask,
    status: TaskStatus
  ) => void;

  onDelete: (
    taskId: string
  ) => void;
};

function priorityLabel(
  priority: TaskPriority
) {
  if (priority === "urgent") {
    return "Urgent";
  }

  if (priority === "high") {
    return "Priorité haute";
  }

  return "Normal";
}

function formatTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function TaskCard({
  task,
  canEdit,
  onStatusChange,
  onDelete,
}: Props) {
  return (
    <article
      className={`task-card task-card-${task.status}`}
    >
      <div className="task-card-top">
        <span
          className={`task-status-dot ${task.status}`}
        />

        <span
          className={`task-priority-text ${task.priority}`}
        >
          {priorityLabel(
            task.priority
          )}
        </span>

        <span className="task-time-badge">
          {formatTime(
            task.due_at
          )}
        </span>
      </div>

      <div className="task-card-content">
        <h3>
          {task.title}
        </h3>

        {task.description && (
          <p>
            {task.description}
          </p>
        )}

        <div className="task-card-meta">
          <span>
            {task.source === "staff"
              ? "Interne"
              : task.source}
          </span>
        </div>
      </div>

      {canEdit && (
        <div className="task-premium-actions">
          {task.status !==
            "in_progress" && (
            <button
              type="button"
              className="task-action-button"
              onClick={() =>
                onStatusChange(
                  task,
                  "in_progress"
                )
              }
            >
              <Clock3 size={13} />

              En cours
            </button>
          )}

          {task.status !==
            "done" && (
            <button
              type="button"
              className="task-action-button success"
              onClick={() =>
                onStatusChange(
                  task,
                  "done"
                )
              }
            >
              <CheckCircle2
                size={13}
              />

              Terminée
            </button>
          )}

          <button
            type="button"
            className="task-icon-button danger"
            onClick={() =>
              onDelete(task.id)
            }
            title="Supprimer"
            aria-label="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </article>
  );
}