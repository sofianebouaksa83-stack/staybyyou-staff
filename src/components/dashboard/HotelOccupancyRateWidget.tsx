import {
  Percent,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function HotelOccupancyRateWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  return (
    <WidgetStatCard
      title="Occupation"
      value={`${data.occupancyRate}%`}
      helper={`${data.inHouseCount} chambre${data.inHouseCount > 1 ? "s" : ""} occupée${data.inHouseCount > 1 ? "s" : ""} sur ${data.roomCount}`}
      to="/hotel"
      icon={<Percent size={18} />}
      loading={data.loadingHotel}
      size={size}
    />
  );
}
