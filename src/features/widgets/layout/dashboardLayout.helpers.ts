import type {
  WidgetDefinition,
} from "../registry/widgetRegistry.types";

import type {
  DashboardViewport,
  DashboardWidgetLayout,
  WidgetSize,
} from "./dashboardLayout.types";

export function getWidgetSize(
  widget: DashboardWidgetLayout,
  definition:
    WidgetDefinition
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

  return definition.defaultSize;
}

export function resizeWidget(
  widget: DashboardWidgetLayout,
  definition:
    WidgetDefinition,
  size: WidgetSize,
  viewport: DashboardViewport
): DashboardWidgetLayout {
  if (
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

  const factor =
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
          base.w * factor
        )
      )
    ),
    h: Math.max(
      2,
      Math.round(
        base.h * factor
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
