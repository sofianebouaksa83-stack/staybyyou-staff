import {
  widgetRegistry,
  type WidgetKey,
} from "../registry/widgetRegistry";

import type {
  DashboardViewport,
  DashboardWidgetLayout,
  WidgetSize,
} from "./dashboardLayout.types";

export function getWidgetSize(
  widget: DashboardWidgetLayout
): WidgetSize {
  const value =
    widget.settings.size;

  if (
    value === "small" ||
    value === "medium" ||
    value === "large"
  ) {
    return value;
  }

  const definition =
    widgetRegistry[
      widget.widgetKey as WidgetKey
    ];

  return (
    definition?.defaultSize ??
    "medium"
  );
}

export function resizeWidget(
  widget: DashboardWidgetLayout,
  size: WidgetSize,
  viewport: DashboardViewport
): DashboardWidgetLayout {
  const definition =
    widgetRegistry[
      widget.widgetKey as WidgetKey
    ];

  if (
    !definition ||
    !definition.sizes.includes(
      size
    )
  ) {
    return widget;
  }

  const base =
    definition.defaultLayout[
      viewport
    ];

  const rank: Record<
    WidgetSize,
    number
  > = {
    small: 0,
    medium: 1,
    large: 2,
  };

  const delta =
    rank[size] -
    rank[
      definition.defaultSize
    ];

  const widthFactor =
    1 + delta * 0.25;

  const heightFactor =
    1 + delta * 0.25;

  const maxWidth =
    viewport === "desktop"
      ? 12
      : 4;

  return {
    ...widget,
    w: Math.min(
      maxWidth,
      Math.max(
        2,
        Math.round(
          base.w *
            widthFactor
        )
      )
    ),
    h: Math.max(
      2,
      Math.round(
        base.h *
          heightFactor
      )
    ),
    settings: {
      ...widget.settings,
      size,
    },
  };
}

export function sortLayout(
  layout: DashboardWidgetLayout[]
) {
  return [...layout].sort(
    (a, b) =>
      a.y - b.y ||
      a.x - b.x
  );
}
