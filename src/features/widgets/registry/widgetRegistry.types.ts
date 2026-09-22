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
  roomService: {
    orders: Array<{
      id: string;
      display_id: string;
      room_name: string;
      guest_name: string;
      status:
        | "new"
        | "accepted"
        | "preparing"
        | "ready"
        | "delivering"
        | "delivered"
        | "cancelled";
      estimated_minutes:
        | number
        | null;
      created_at: string;
      service_type: string;
    }>;
    lateOrders: Array<{
      id: string;
      display_id: string;
      room_name: string;
      guest_name: string;
      status:
        | "new"
        | "accepted"
        | "preparing"
        | "ready"
        | "delivering"
        | "delivered"
        | "cancelled";
      estimated_minutes:
        | number
        | null;
      created_at: string;
      service_type: string;
    }>;
    loading: boolean;
    error: string | null;
  };
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
