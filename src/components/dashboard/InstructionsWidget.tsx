import {
  ClipboardList,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import {
  useInstructionsWidget,
} from "../../features/widgets/instructions/useInstructionsWidget";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function InstructionsWidget({
  size,
}: DashboardWidgetComponentProps) {
  const {
    instructions,
    loading,
    error,
  } =
    useInstructionsWidget();

  if (size === "small") {
    return (
      <Link
        to="/instructions"
        className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small"
      >
        <div className="dashboard-widget-card__icon">
          <ClipboardList
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Consignes
          </span>
          <strong>
            {loading
              ? "…"
              : instructions.length}
          </strong>
        </div>
      </Link>
    );
  }

  const limit =
    size === "large"
      ? 5
      : 3;

  return (
    <section className={`dashboard-widget-card dashboard-widget-card--list dashboard-widget-card--${size}`}>
      <div className="dashboard-widget-card__header">
        <div>
          <span className="dashboard-widget-card__eyebrow">
            ÉQUIPE
          </span>
          <h2>
            Consignes
          </h2>
        </div>

        <Link to="/instructions">
          Tout voir
        </Link>
      </div>

      {error ? (
        <p className="dashboard-widget-card__error">
          {error}
        </p>
      ) : loading ? (
        <p className="dashboard-widget-card__empty">
          Chargement…
        </p>
      ) : instructions.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucune consigne aujourd'hui.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {instructions
            .slice(0, limit)
            .map(
              (
                instruction
              ) => (
                <div
                  className="dashboard-widget-feed"
                  key={
                    instruction.id
                  }
                >
                  <div>
                    <strong>
                      {
                        instruction.title
                      }
                    </strong>
                    {size ===
                      "large" && (
                      <p>
                        {
                          instruction.content
                        }
                      </p>
                    )}
                  </div>

                  <small>
                    {
                      instruction.shift ===
                      "all"
                        ? "Toute la journée"
                        : instruction.shift
                    }
                  </small>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}
