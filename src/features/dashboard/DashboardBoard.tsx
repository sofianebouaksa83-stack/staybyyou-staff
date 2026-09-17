import { FnbServicesWidget } from "../../components/dashboard/FnbServicesWidget";

import { DashboardStats } from "./DashboardStats";
import { DashboardTasks } from "./DashboardTasks";
import { useDashboard } from "./useDashboard";

function formatDayLabel(date: Date) {
  return date
    .toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    )
    .toUpperCase();
}

export function DashboardBoard() {
  const {
    user,
    selectedDate,

    openTasks,
    dashboardTasks,

    arrivals,
    departures,
    inHouse,

    activeFollowups,
    urgentFollowups,

    loadingTasks,
    loadingHotel,

    tasksError,
    hotelError,
    } = useDashboard();

  return (
    <div>
      <div className="welcome">
        <span className="eyebrow">
          {formatDayLabel(
            selectedDate
          )}
        </span>

        <h1>
          Bonjour {user.firstName}
        </h1>

        <p>
          Voici l'essentiel
          pour votre journée.
        </p>
      </div>

      <DashboardStats
        arrivalsCount={arrivals.length}
        inHouseCount={inHouse.length}
        departuresCount={departures.length}
        followupsCount={activeFollowups.length}
        urgentFollowupsCount={urgentFollowups.length}
        openTasksCount={openTasks.length}
        loadingHotel={loadingHotel}
        loadingTasks={loadingTasks}
        />

        {hotelError && (
        <div className="hotel-error">
            {hotelError}
        </div>
        )}

        <div className="dashboard-operations">
        <FnbServicesWidget />

        <DashboardTasks
            tasks={dashboardTasks}
            loading={loadingTasks}
            error={tasksError}
        />
        </div>
    </div>
  );
}