import type {
  ComponentType,
} from "react";

import type {
  DashboardWidgetLayout,
  DashboardWidgetSettings,
  WidgetSize,
} from "../layout/dashboardLayout.types";

import type {
  FnbDashboardService,
} from "../fnb/useFnbDashboardData";

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

  roomCount: number;

  occupancyRate: number;

  followupsCount: number;

  urgentFollowupsCount: number;

  openTasksCount: number;

  dashboardTasks: Array<{
    id: string;

    title: string;

    description:
      string | null;

    priority:
      | "normal"
      | "high"
      | "urgent";

    due_at:
      string | null;
  }>;

  loadingHotel: boolean;

  loadingTasks: boolean;

  hotelError:
    string | null;

  tasksError:
    string | null;

  fnbSummary: {
    reservations: number;

    capacity: number;

    loading: boolean;

    error:
      string | null;
  };

  fnb: {
    services:
      FnbDashboardService[];

    loading:
      boolean;

    error:
      string | null;

    updateReservations: (
      serviceId:
        string,

      reservations:
        number
    ) =>
      Promise<boolean>;
  };

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
        number | null;

      created_at:
        string;

      service_type:
        string;
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
        number | null;

      created_at:
        string;

      service_type:
        string;
    }>;

    loading:
      boolean;

    error:
      string | null;
  };
};

export type DashboardWidgetComponentProps = {
  size: WidgetSize;

  data: DashboardWidgetData;

  instanceKey: string;

  settings:
    DashboardWidgetSettings;

  editMode?: boolean;

  canConfigure?: boolean;

  onSettingsChange?: (
    settings:
      DashboardWidgetSettings
  ) => Promise<boolean>;
};

export type WidgetDefinition = {
  widgetKey: string;

  title: string;

  description: string;

  category:
    WidgetCategory;

  permission: string;

  allowMultiple?:
    boolean;

  sizes:
    WidgetSize[];

  defaultSize:
    WidgetSize;

  component:
    ComponentType<
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