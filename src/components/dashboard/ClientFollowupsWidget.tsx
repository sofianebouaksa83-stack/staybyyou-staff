import {
  AlertTriangle,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function ClientFollowupsWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  const helper =
    data.urgentFollowupsCount > 0
      ? `${data.urgentFollowupsCount} urgent${data.urgentFollowupsCount > 1 ? "s" : ""}`
      : "aucun suivi urgent";

  return (
    <WidgetStatCard
      title="Suivis clients"
      value={data.followupsCount}
      helper={helper}
      to="/hotel"
      icon={<AlertTriangle size={18} />}
      loading={data.loadingHotel}
      size={size}
    />
  );
}
