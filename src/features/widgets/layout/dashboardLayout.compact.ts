import type {
  DashboardViewport,
  DashboardWidgetLayout,
} from "./dashboardLayout.types";

export function compactDashboardLayout(
  layout: DashboardWidgetLayout[],
  viewport: DashboardViewport
) {
  const columns =
    viewport === "desktop"
      ? 12
      : 4;

  let x = 0;
  let y = 0;
  let rowHeight = 0;

  return layout.map(
    (widget) => {
      const width =
        Math.min(
          columns,
          Math.max(
            1,
            widget.w
          )
        );

      if (
        x > 0 &&
        x + width >
          columns
      ) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }

      const next = {
        ...widget,
        x,
        y,
        w: width,
      };

      x += width;
      rowHeight =
        Math.max(
          rowHeight,
          widget.h
        );

      if (x >= columns) {
        x = 0;
        y += rowHeight;
        rowHeight = 0;
      }

      return next;
    }
  );
}

export function moveWidgetBefore(
  layout: DashboardWidgetLayout[],
  sourceKey: string,
  targetKey: string,
  viewport: DashboardViewport
) {
  if (
    sourceKey === targetKey
  ) {
    return layout;
  }

  const sourceIndex =
    layout.findIndex(
      (item) =>
        item.widgetKey ===
        sourceKey
    );

  const targetIndex =
    layout.findIndex(
      (item) =>
        item.widgetKey ===
        targetKey
    );

  if (
    sourceIndex < 0 ||
    targetIndex < 0
  ) {
    return layout;
  }

  const next = [...layout];
  const [source] =
    next.splice(
      sourceIndex,
      1
    );

  next.splice(
    targetIndex,
    0,
    source
  );

  return compactDashboardLayout(
    next,
    viewport
  );
}
