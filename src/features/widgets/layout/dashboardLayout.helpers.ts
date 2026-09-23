import type {
  WidgetDefinition,
} from "../registry/widgetRegistry.types";

import type {
  DashboardViewport,
  DashboardWidgetLayout,
  WidgetSize,
} from "./dashboardLayout.types";

const SIZE_RANK: Record<
  WidgetSize,
  number
> = {
  small: 0,
  medium: 1,
  large: 2,
};

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

export function getWidgetDimensionsForSize(
  definition:
    WidgetDefinition,
  size:
    WidgetSize,
  viewport:
    DashboardViewport
) {
  const base =
    definition.defaultLayout[
      viewport
    ];

  const delta =
    SIZE_RANK[size] -
    SIZE_RANK[
      definition.defaultSize
    ];

  const factor =
    1 + delta * 0.25;

  const maxWidth =
    viewport === "desktop"
      ? 12
      : 4;

  return {
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
  };
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

  const dimensions =
    getWidgetDimensionsForSize(
      definition,
      size,
      viewport
    );

  return {
    ...widget,

    w: dimensions.w,
    h: dimensions.h,

    settings: {
      ...widget.settings,
      size,
    },
  };
}

export function getWidgetResizeBounds(
  definition:
    WidgetDefinition,
  viewport:
    DashboardViewport
) {
  const dimensions =
    definition.sizes.map(
      (size) =>
        getWidgetDimensionsForSize(
          definition,
          size,
          viewport
        )
    );

  return {
    minW:
      Math.min(
        ...dimensions.map(
          (item) =>
            item.w
        )
      ),

    maxW:
      Math.max(
        ...dimensions.map(
          (item) =>
            item.w
        )
      ),

    minH:
      Math.min(
        ...dimensions.map(
          (item) =>
            item.h
        )
      ),

    maxH:
      Math.max(
        ...dimensions.map(
          (item) =>
            item.h
        )
      ),
  };
}

export function getClosestWidgetSize(
  definition:
    WidgetDefinition,
  viewport:
    DashboardViewport,
  w: number,
  h: number
): WidgetSize {
  let closest =
    definition.defaultSize;

  let bestScore =
    Number.POSITIVE_INFINITY;

  for (
    const size
    of definition.sizes
  ) {
    const dimensions =
      getWidgetDimensionsForSize(
        definition,
        size,
        viewport
      );

    const score =
      Math.abs(
        dimensions.w - w
      ) +
      Math.abs(
        dimensions.h - h
      );

    if (
      score < bestScore
    ) {
      bestScore =
        score;

      closest =
        size;
    }
  }

  return closest;
}

export function sortLayout(
  layout:
    DashboardWidgetLayout[]
) {
  return [...layout].sort(
    (a, b) =>
      a.y - b.y ||
      a.x - b.x
  );
}