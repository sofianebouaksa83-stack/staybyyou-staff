import {
  useState,
} from "react";
import {
  GripVertical,
  Minus,
} from "lucide-react";

import {
  getWidgetSize,
  resizeWidget,
  sortLayout,
} from "../../features/widgets/layout/dashboardLayout.helpers";
import {
  compactDashboardLayout,
  moveWidgetBefore,
} from "../../features/widgets/layout/dashboardLayout.compact";
import type {
  DashboardViewport,
  DashboardWidgetLayout,
  WidgetSize,
} from "../../features/widgets/layout/dashboardLayout.types";
import {
  widgetRegistry,
  type WidgetKey,
} from "../../features/widgets/registry/widgetRegistry";
import type {
  DashboardWidgetData,
} from "../../features/widgets/registry/widgetRegistry.types";

type Props = {
  layout: DashboardWidgetLayout[];
  data: DashboardWidgetData;
  viewport: DashboardViewport;
  editMode: boolean;
  onLocalChange: (
    layout:
      DashboardWidgetLayout[]
  ) => void;
  onCommit: (
    layout:
      DashboardWidgetLayout[]
  ) => Promise<boolean>;
  onRemove: (
    widgetKey: string
  ) => Promise<boolean>;
};

export function DashboardGrid({
  layout,
  data,
  viewport,
  editMode,
  onLocalChange,
  onCommit,
  onRemove,
}: Props) {
  const [
    pointerSourceKey,
    setPointerSourceKey,
  ] = useState<string | null>(
    null
  );

  const sorted =
    sortLayout(layout);

  function handleDrop(
    sourceKey: string,
    targetKey: string
  ) {
    const next =
      moveWidgetBefore(
        sorted,
        sourceKey,
        targetKey,
        viewport
      );

    onLocalChange(next);
    void onCommit(next);
  }

  function handleResize(
    widget:
      DashboardWidgetLayout,
    size: WidgetSize
  ) {
    const resized =
      resizeWidget(
        widget,
        size,
        viewport
      );

    const next =
      compactDashboardLayout(
        sorted.map(
          (item) =>
            item.widgetKey ===
            widget.widgetKey
              ? resized
              : item
        ),
        viewport
      );

    onLocalChange(next);
    void onCommit(next);
  }

  return (
    <div
      className={`dashboard-widget-grid dashboard-widget-grid--${viewport} ${
        editMode
          ? "dashboard-widget-grid--editing"
          : ""
      }`}
    >
      {sorted.map(
        (widget) => {
          const definition =
            widgetRegistry[
              widget.widgetKey as WidgetKey
            ];

          if (!definition) {
            return null;
          }

          const Component =
            definition.component;

          const size =
            getWidgetSize(
              widget
            );

          return (
            <article
              key={
                widget.widgetKey
              }
              data-widget-key={
                widget.widgetKey
              }
              className="dashboard-widget-slot"
              style={{
                gridColumn: `${widget.x + 1} / span ${widget.w}`,
                gridRow: `${widget.y + 1} / span ${widget.h}`,
              }}
              draggable={
                editMode
              }
              onDragStart={(
                event
              ) => {
                event.dataTransfer.setData(
                  "text/widget-key",
                  widget.widgetKey
                );
                event.dataTransfer.effectAllowed =
                  "move";
              }}
              onDragOver={(
                event
              ) => {
                if (
                  editMode
                ) {
                  event.preventDefault();
                }
              }}
              onDrop={(
                event
              ) => {
                if (
                  !editMode
                ) {
                  return;
                }

                event.preventDefault();

                const sourceKey =
                  event.dataTransfer.getData(
                    "text/widget-key"
                  );

                if (
                  sourceKey
                ) {
                  handleDrop(
                    sourceKey,
                    widget.widgetKey
                  );
                }
              }}
            >
              {editMode && (
                <div className="dashboard-widget-editbar">
                  <button
                    type="button"
                    className="dashboard-widget-drag"
                    aria-label={`Déplacer ${definition.title}`}
                    title="Déplacer"
                    onPointerDown={(
                      event
                    ) => {
                      setPointerSourceKey(
                        widget.widgetKey
                      );

                      event.currentTarget.setPointerCapture(
                        event.pointerId
                      );
                    }}
                    onPointerUp={(
                      event
                    ) => {
                      const sourceKey =
                        pointerSourceKey;

                      setPointerSourceKey(
                        null
                      );

                      if (
                        !sourceKey
                      ) {
                        return;
                      }

                      const target =
                        document
                          .elementFromPoint(
                            event.clientX,
                            event.clientY
                          )
                          ?.closest<HTMLElement>(
                            "[data-widget-key]"
                          )
                          ?.dataset
                          .widgetKey;

                      if (target) {
                        handleDrop(
                          sourceKey,
                          target
                        );
                      }
                    }}
                    onPointerCancel={() =>
                      setPointerSourceKey(
                        null
                      )
                    }
                  >
                    <GripVertical
                      size={16}
                    />
                  </button>

                  <div className="dashboard-widget-sizes">
                    {definition.sizes.map(
                      (
                        allowedSize
                      ) => (
                        <button
                          type="button"
                          key={
                            allowedSize
                          }
                          className={
                            allowedSize ===
                            size
                              ? "active"
                              : ""
                          }
                          onClick={() =>
                            handleResize(
                              widget,
                              allowedSize
                            )
                          }
                        >
                          {allowedSize ===
                          "small"
                            ? "S"
                            : allowedSize ===
                                "medium"
                              ? "M"
                              : "L"}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="dashboard-widget-remove"
                    aria-label={`Retirer ${definition.title}`}
                    onClick={() =>
                      void onRemove(
                        widget.widgetKey
                      )
                    }
                  >
                    <Minus
                      size={15}
                    />
                  </button>
                </div>
              )}

              <Component
                size={size}
                data={data}
              />
            </article>
          );
        }
      )}
    </div>
  );
}
