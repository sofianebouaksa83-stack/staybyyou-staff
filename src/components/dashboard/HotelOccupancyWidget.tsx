import {
  Hotel,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function HotelOccupancyWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  return (
    <WidgetStatCard
      title="En séjour"
      value={data.inHouseCount}
      helper="clients actuellement hébergés"
      to="/hotel"
      icon={<Hotel size={18} />}
      loading={data.loadingHotel}
      size={size}
    />
  );
}
