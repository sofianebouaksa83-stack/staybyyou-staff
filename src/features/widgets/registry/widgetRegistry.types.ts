import type {
  ComponentType,
} from "react";

import type {
  DashboardWidgetLayout,
  WidgetSize,
} from "../layout/dashboardLayout.types";

export type WidgetCategory =
  | "hotel"
  | "team"
  | "fnb"
  | "room-service"
  | "other";

export type DashboardWidgetData = {
  arrivalsCount: number;
  departuresCount: number;
  inHouseCount: number;
  followupsCount: number;
  urgentFollowupsCount: number;
  openTasksCount: number;
  dashboardTasks: Array<{
    id: string;
    title: string;
    description: string | null;
    priority: "normal" | "high" | "urgent";
    due_at: string | null;
  }>;
  loadingHotel: boolean;
  loadingTasks: boolean;
  hotelError: string | null;
  tasksError: string | null;
};

export type DashboardWidgetComponentProps = {
  size: WidgetSize;
  data: DashboardWidgetData;
};

export type WidgetDefinition = {
  widgetKey: string;
  title: string;
  description: string;
  category: WidgetCategory;
  permission: string;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  component: ComponentType<
    DashboardWidgetComponentProps
  >;
  defaultLayout: {
    desktop: Pick<
      DashboardWidgetLayout,
      "w" | "h"
    >;
    mobile: Pick<
      DashboardWidgetLayout,
      "w" | "h"
    >;
  };
};
