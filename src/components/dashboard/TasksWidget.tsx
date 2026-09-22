import {
  CheckSquare,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

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

export function TasksWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  if (size === "small") {
    return (
      <Link
        to="/tasks"
        className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small"
      >
        <div className="dashboard-widget-card__icon">
          <CheckSquare
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>Tâches</span>
          <strong>
            {data.loadingTasks
              ? "…"
              : data.openTasksCount}
          </strong>
        </div>
      </Link>
    );
  }

  const limit =
    size === "large" ? 4 : 3;

  return (
    <section
      className={`dashboard-widget-card dashboard-widget-card--list dashboard-widget-card--${size}`}
    >
      <div className="dashboard-widget-card__header">
        <div>
          <span className="dashboard-widget-card__eyebrow">
            ÉQUIPE
          </span>
          <h2>Mes tâches</h2>
        </div>

        <Link to="/tasks">
          Tout voir
        </Link>
      </div>

      {data.tasksError && (
        <p className="dashboard-widget-card__error">
          {data.tasksError}
        </p>
      )}

      {data.loadingTasks ? (
        <p className="dashboard-widget-card__empty">
          Chargement…
        </p>
      ) : data.dashboardTasks.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucune tâche à traiter aujourd'hui.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {data.dashboardTasks
            .slice(0, limit)
            .map(
              (task) => (
                <div
                  className="dashboard-widget-list__row"
                  key={task.id}
                >
                  <span
                    className={`dashboard-widget-priority dashboard-widget-priority--${task.priority}`}
                  />

                  <div>
                    <strong>
                      {task.title}
                    </strong>

                    {size ===
                      "large" && (
                      <p>
                        {task.description ||
                          "Tâche interne"}
                      </p>
                    )}
                  </div>

                  <small>
                    {formatTime(
                      task.due_at
                    )}
                  </small>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}
