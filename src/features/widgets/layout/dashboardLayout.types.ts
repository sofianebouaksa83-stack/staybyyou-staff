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

  /**
   * Identifie une instance précise.
   *
   * Les widgets classiques utilisent "default".
   * Les widgets duplicables utilisent une clé unique.
   */
  instanceKey: string;

  x: number;
  y: number;

  w: number;
  h: number;

  visible: boolean;

  stackId:
    string | null;

  stackOrder:
    number;

  settings:
    DashboardWidgetSettings;
};

export type DashboardWidgetRow = {
  id: string;

  hotel_id: string;
  user_id: string;

  viewport:
    DashboardViewport;

  widget_key: string;

  instance_key: string;

  x: number;
  y: number;

  w: number;
  h: number;

  visible: boolean;

  stack_id:
    string | null;

  stack_order:
    number;

  settings:
    DashboardWidgetSettings | null;

  created_at: string;
  updated_at: string;
};

export type DashboardLayoutIdentity = {
  hotelId: string;
  userId: string;

  viewport:
    DashboardViewport;
};