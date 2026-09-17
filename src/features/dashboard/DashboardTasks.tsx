import {
  CheckSquare,
} from "lucide-react";

import { Link } from "react-router-dom";

import type {
  StaffTask,
} from "../../services/tasksService";

type Props = {
  tasks: StaffTask[];
  loading: boolean;
  error: string | null;
};

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

export function DashboardTasks({
  tasks,
  loading,
  error,
}: Props) {
  return (
    <section className="panel">
      <div className="panel-title">
        <div className="title-with-icon">
          <CheckSquare
            size={18}
          />

          <h2>
            Mes tâches
          </h2>
        </div>

        <Link to="/tasks">
          Tout voir
        </Link>
      </div>

      {error && (
        <p
          style={{
            color: "#a84d46",
            fontSize: 12,
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <p
          style={{
            opacity: 0.6,
            fontSize: 12,
          }}
        >
          Chargement…
        </p>
      ) : tasks.length === 0 ? (
        <p
          style={{
            opacity: 0.6,
            fontSize: 12,
          }}
        >
          Aucune tâche à traiter
          aujourd'hui.
        </p>
      ) : (
        tasks.map(
          (task) => (
            <div
              className="task-row"
              key={task.id}
            >
              <span
                className={`priority-bar ${task.priority}`}
              />

              <div>
                <strong>
                  {task.title}
                </strong>

                <p>
                  {task.description ||
                    "Tâche interne"}
                </p>
              </div>

              <small>
                {formatTime(
                  task.due_at
                )}
              </small>
            </div>
          )
        )
      )}
    </section>
  );
}