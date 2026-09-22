import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";
import {
  FnbServicesWidget,
} from "./FnbServicesWidget";

export function FnbWidget(
  _props: DashboardWidgetComponentProps
) {
  return (
    <div className="dashboard-widget-legacy">
      <FnbServicesWidget />
    </div>
  );
}
