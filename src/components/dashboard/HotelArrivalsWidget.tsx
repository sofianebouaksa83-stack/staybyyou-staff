import {
  BedDouble,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function HotelArrivalsWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  return (
    <WidgetStatCard
      title="Arrivées"
      value={data.arrivalsCount}
      helper={`${data.inHouseCount} séjour${data.inHouseCount > 1 ? "s" : ""} en cours`}
      to="/hotel?tab=arrival"
      icon={<BedDouble size={18} />}
      loading={data.loadingHotel}
      size={size}
    />
  );
}
