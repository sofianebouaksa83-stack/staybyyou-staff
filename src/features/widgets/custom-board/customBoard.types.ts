import type {
  WidgetSize,
} from "../layout/dashboardLayout.types";

export type CustomBoardSource =
  | "manual"
  | "fnb"
  | "hotel"
  | "room_service"
  | "sevenrooms"
  | "opera";

export type CustomBoardDensity =
  | "compact"
  | "comfortable";

export type CustomBoardItem = {
  id: string;

  label: string;
  subtitle: string;

  source:
    CustomBoardSource;

  sourceId:
    string | null;

  value:
    number | null;

  capacity:
    number | null;
};

export type CustomBoardSettings = {
  title: string;

  eyebrow: string;

  size:
    WidgetSize;

  density:
    CustomBoardDensity;

  showSubtitle:
    boolean;

  showValue:
    boolean;

  showCapacity:
    boolean;

  items:
    CustomBoardItem[];
};