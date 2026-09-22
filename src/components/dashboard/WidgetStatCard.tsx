import type {
  ReactNode,
} from "react";
import {
  Link,
} from "react-router-dom";

import type {
  WidgetSize,
} from "../../features/widgets/layout/dashboardLayout.types";

type Props = {
  title: string;
  value: number | string;
  helper: string;
  to: string;
  icon: ReactNode;
  loading?: boolean;
  size: WidgetSize;
};

export function WidgetStatCard({
  title,
  value,
  helper,
  to,
  icon,
  loading = false,
  size,
}: Props) {
  return (
    <Link
      to={to}
      className={`dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--${size}`}
    >
      <div className="dashboard-widget-card__icon">
        {icon}
      </div>

      <div className="dashboard-widget-card__body">
        <span>{title}</span>
        <strong>
          {loading ? "…" : value}
        </strong>

        {size !== "small" && (
          <small>
            {loading
              ? "Chargement…"
              : helper}
          </small>
        )}
      </div>
    </Link>
  );
}
