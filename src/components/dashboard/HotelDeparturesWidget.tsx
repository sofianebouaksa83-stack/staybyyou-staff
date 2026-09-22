import {
  CalendarDays,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function HotelDeparturesWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  return (
    <WidgetStatCard
      title="Départs"
      value={data.departuresCount}
      helper="pour la journée"
      to="/hotel?tab=departure"
      icon={<CalendarDays size={18} />}
      loading={data.loadingHotel}
      size={size}
    />
  );
}
