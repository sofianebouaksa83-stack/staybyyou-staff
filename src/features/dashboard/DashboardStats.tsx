import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  CheckSquare,
} from "lucide-react";

import { Link } from "react-router-dom";

type Props = {
  arrivalsCount: number;
  inHouseCount: number;
  departuresCount: number;

  followupsCount: number;
  urgentFollowupsCount: number;

  openTasksCount: number;

  loadingHotel: boolean;
  loadingTasks: boolean;
};

export function DashboardStats({
  arrivalsCount,
  inHouseCount,
  departuresCount,

  followupsCount,
  urgentFollowupsCount,

  openTasksCount,

  loadingHotel,
  loadingTasks,
}: Props) {
  return (
    <section className="stats-grid">
      <Link
        to="/hotel?tab=arrival"
        className="stat-card"
      >
        <div className="stat-icon">
          <BedDouble />
        </div>

        <span>Arrivées</span>

        <strong>
          {loadingHotel
            ? "…"
            : arrivalsCount}
        </strong>

        <small>
          {loadingHotel
            ? "Chargement…"
            : `${inHouseCount} séjours en cours`}
        </small>
      </Link>

      <Link
        to="/hotel?tab=departure"
        className="stat-card"
      >
        <div className="stat-icon">
          <CalendarDays />
        </div>

        <span>Départs</span>

        <strong>
          {loadingHotel
            ? "…"
            : departuresCount}
        </strong>

        <small>
          pour la journée
        </small>
      </Link>

      <Link
        to="/hotel"
        className="stat-card"
      >
        <div className="stat-icon">
          <AlertTriangle />
        </div>

        <span>À surveiller</span>

        <strong>
          {loadingHotel
            ? "…"
            : followupsCount}
        </strong>

        <small>
          {loadingHotel
            ? "Chargement…"
            : urgentFollowupsCount > 0
              ? `${urgentFollowupsCount} urgent${
                  urgentFollowupsCount > 1
                    ? "s"
                    : ""
                }`
              : "aucun suivi urgent"}
        </small>
      </Link>

      <Link
        to="/tasks"
        className="stat-card"
      >
        <div className="stat-icon">
          <CheckSquare />
        </div>

        <span>Mes tâches</span>

        <strong>
          {loadingTasks
            ? "…"
            : openTasksCount}
        </strong>

        <small>
          à traiter aujourd'hui
        </small>
      </Link>
    </section>
  );
}