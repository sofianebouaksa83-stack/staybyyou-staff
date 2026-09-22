import {
  CalendarCheck2,
} from "lucide-react";

import {
  WidgetStatCard,
} from "./WidgetStatCard";
import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

export function FnbReservationsWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  return (
    <WidgetStatCard
      title="Réservations"
      value={
        data.fnbSummary
          .reservations
      }
      helper="couverts / réservations renseignés aujourd'hui"
      to="/"
      icon={
        <CalendarCheck2
          size={18}
        />
      }
      loading={
        data.fnbSummary
          .loading
      }
      size={size}
    />
  );
}

export function FnbCapacityWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  const {
    reservations,
    capacity,
    loading,
  } = data.fnbSummary;

  const rate =
    capacity > 0
      ? Math.round(
          (reservations /
            capacity) *
            100
        )
      : 0;

  return (
    <WidgetStatCard
      title="Capacité"
      value={`${rate}%`}
      helper={`${reservations} / ${capacity} places renseignées`}
      to="/"
      icon={
        <CalendarCheck2
          size={18}
        />
      }
      loading={loading}
      size={size}
    />
  );
}
