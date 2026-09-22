import {
  widgetRegistry,
  type WidgetKey,
} from "../registry/widgetRegistry";

import type {
  DashboardViewport,
  DashboardWidgetLayout,
  WidgetSize,
} from "./dashboardLayout.types";

type DefaultPosition = {
  widgetKey: WidgetKey;
  x: number;
  y: number;
  size?: WidgetSize;
};

const DESKTOP: DefaultPosition[] = [
  {
    widgetKey:
      "hotel_arrivals",
    x: 0,
    y: 0,
  },
  {
    widgetKey:
      "hotel_departures",
    x: 3,
    y: 0,
  },
  {
    widgetKey:
      "hotel_in_house",
    x: 6,
    y: 0,
  },
  {
    widgetKey:
      "client_followups",
    x: 9,
    y: 0,
  },
  {
    widgetKey:
      "fnb_services",
    x: 0,
    y: 2,
    size: "large",
  },
  {
    widgetKey:
      "tasks_today",
    x: 8,
    y: 2,
    size: "medium",
  },
  {
    widgetKey:
      "messages_recent",
    x: 0,
    y: 6,
    size: "medium",
  },
  {
    widgetKey:
      "instructions_today",
    x: 4,
    y: 6,
    size: "medium",
  },
  {
    widgetKey:
      "events_today",
    x: 8,
    y: 6,
    size: "medium",
  },
];

const MOBILE: DefaultPosition[] = [
  {
    widgetKey:
      "hotel_arrivals",
    x: 0,
    y: 0,
  },
  {
    widgetKey:
      "hotel_departures",
    x: 2,
    y: 0,
  },
  {
    widgetKey:
      "hotel_in_house",
    x: 0,
    y: 2,
  },
  {
    widgetKey:
      "client_followups",
    x: 2,
    y: 2,
  },
  {
    widgetKey:
      "tasks_today",
    x: 0,
    y: 4,
    size: "medium",
  },
  {
    widgetKey:
      "fnb_services",
    x: 0,
    y: 8,
    size: "large",
  },
  {
    widgetKey:
      "messages_recent",
    x: 0,
    y: 13,
    size: "medium",
  },
  {
    widgetKey:
      "instructions_today",
    x: 0,
    y: 17,
    size: "medium",
  },
  {
    widgetKey:
      "events_today",
    x: 0,
    y: 21,
    size: "medium",
  },
];

export function getDefaultDashboardLayout(
  viewport: DashboardViewport
): DashboardWidgetLayout[] {
  const source =
    viewport === "desktop"
      ? DESKTOP
      : MOBILE;

  return source.map(
    ({
      widgetKey,
      x,
      y,
      size,
    }) => {
      const definition =
        widgetRegistry[
          widgetKey
        ];

      const dimensions =
        definition
          .defaultLayout[
          viewport
        ];

      return {
        widgetKey,
        x,
        y,
        w: dimensions.w,
        h: dimensions.h,
        visible: true,
        settings: {
          size:
            size ??
            definition.defaultSize,
        },
      };
    }
  );
}
