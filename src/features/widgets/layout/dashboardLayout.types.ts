export type DashboardViewport =
  | "desktop"
  | "mobile";

export type WidgetSize =
  | "small"
  | "medium"
  | "large";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | {
      [key: string]: JsonValue;
    };

export type DashboardWidgetSettings = {
  [key: string]: JsonValue;
};

export type DashboardWidgetLayout = {
  id?: string;
  widgetKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  settings: DashboardWidgetSettings;
};

export type DashboardWidgetRow = {
  id: string;
  hotel_id: string;
  user_id: string;
  viewport: DashboardViewport;
  widget_key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  settings: DashboardWidgetSettings | null;
  created_at: string;
  updated_at: string;
};

export type DashboardLayoutIdentity = {
  hotelId: string;
  userId: string;
  viewport: DashboardViewport;
};
