import {
  GripVertical,
  Minus,
} from "lucide-react";

import {
  getWidgetSize,
} from "../../features/widgets/layout/dashboardLayout.helpers";

import type {
  DashboardWidgetLayout,
  DashboardWidgetSettings,
} from "../../features/widgets/layout/dashboardLayout.types";

import {
  widgetRegistry,
  type WidgetKey,
} from "../../features/widgets/registry/widgetRegistry";

import type {
  DashboardWidgetData,
} from "../../features/widgets/registry/widgetRegistry.types";

const STRUCTURED_WIDGETS =
  new Set<string>([
    "fnb_services",
    "tasks_today",
    "messages_recent",
    "instructions_today",
    "events_today",
    "hotel_occupancy",
    "notifications",
    "room_service_active",
    "custom_board",
  ]);

type Props = {
  layout:
    DashboardWidgetLayout[];

  data:
    DashboardWidgetData;

  editMode:
    boolean;

  onCommit: (
    layout:
      DashboardWidgetLayout[]
  ) => Promise<boolean>;

  onHide: (
    widgetKey:
      string,
    instanceKey:
      string
  ) => Promise<boolean>;

  onUpdateSettings: (
    widgetKey:
      string,
    instanceKey:
      string,
    settings:
      DashboardWidgetSettings
  ) => Promise<boolean>;
  canConfigure: boolean;
};

function getWidgetIdentity(
  widget:
    DashboardWidgetLayout
) {
  return `${widget.widgetKey}:${widget.instanceKey}`;
}

function sortWidgets(
  layout:
    DashboardWidgetLayout[]
) {
  return layout
    .filter(
      (
        widget
      ) =>
        widget.visible &&
        STRUCTURED_WIDGETS.has(
          widget.widgetKey
        )
    )
    .sort(
      (
        a,
        b
      ) =>
        a.y - b.y ||
        a.x - b.x
    );
}

export function StructuredDashboardGrid({
  layout,
  data,
  editMode,
  canConfigure,
  onCommit,
  onHide,
  onUpdateSettings,
}: Props) {
  const ordered =
    sortWidgets(
      layout
    );

  function handleDrop(
    sourceId:
      string,

    targetId:
      string
  ) {
    if (
      !sourceId ||
      sourceId ===
        targetId
    ) {
      return;
    }

    const visibleIds =
      ordered.map(
        getWidgetIdentity
      );

    const sourceIndex =
      visibleIds.indexOf(
        sourceId
      );

    const targetIndex =
      visibleIds.indexOf(
        targetId
      );

    if (
      sourceIndex < 0 ||
      targetIndex < 0
    ) {
      return;
    }

    const reordered = [
      ...visibleIds,
    ];

    const [
      moved,
    ] =
      reordered.splice(
        sourceIndex,
        1
      );

    reordered.splice(
      targetIndex,
      0,
      moved
    );

    const orderMap =
      new Map(
        reordered.map(
          (
            id,
            index
          ) => [
            id,
            index,
          ]
        )
      );

    const next =
      layout.map(
        (
          widget
        ) => {
          const order =
            orderMap.get(
              getWidgetIdentity(
                widget
              )
            );

          if (
            order ===
            undefined
          ) {
            return widget;
          }

          return {
            ...widget,

            x: 0,
            y: order,
          };
        }
      );

    void onCommit(
      next
    );
  }

  if (
    ordered.length ===
    0
  ) {
    return (
      <div className="structured-dashboard-empty">
        Aucun bloc ajouté
        à votre accueil.
      </div>
    );
  }

  return (
    <div
      className={`structured-dashboard-grid ${
        editMode
          ? "structured-dashboard-grid--editing"
          : ""
      }`}
    >
      {ordered.map(
        (
          widget
        ) => {
          const definition =
            widgetRegistry[
              widget.widgetKey as WidgetKey
            ];

          if (
            !definition
          ) {
            return null;
          }

          const Component =
            definition.component;

          const size =
            getWidgetSize(
              widget,
              definition
            );

          const identity =
            getWidgetIdentity(
              widget
            );

          return (
            <article
              key={
                identity
              }
              className={[
                "structured-dashboard-block",

                `structured-dashboard-block--${widget.widgetKey}`,

                `structured-dashboard-block--size-${size}`,
              ].join(
                " "
              )}
              onDragOver={(
                event
              ) => {
                if (
                  !editMode
                ) {
                  return;
                }

                event.preventDefault();

                event.dataTransfer.dropEffect =
                  "move";
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

                const sourceId =
                  event.dataTransfer.getData(
                    "text/dashboard-widget"
                  );

                handleDrop(
                  sourceId,
                  identity
                );
              }}
            >
              {editMode && (
                <div className="structured-dashboard-editbar">
                  <span
                    className="structured-dashboard-drag"
                    draggable
                    onDragStart={(
                      event
                    ) => {
                      event.dataTransfer.setData(
                        "text/dashboard-widget",
                        identity
                      );

                      event.dataTransfer.effectAllowed =
                        "move";
                    }}
                  >
                    <GripVertical
                      size={
                        16
                      }
                    />

                    Déplacer
                  </span>

                  <span className="structured-dashboard-edit-title">
                    {
                      definition.title
                    }
                  </span>

                  <button
                    type="button"
                    title="Masquer"
                    aria-label={`Masquer ${definition.title}`}
                    onClick={() =>
                      void onHide(
                        widget.widgetKey,
                        widget.instanceKey
                      )
                    }
                  >
                    <Minus
                      size={
                        15
                      }
                    />
                  </button>
                </div>
              )}

              <Component
                size={size}
                data={data}
                instanceKey={
                    widget.instanceKey
                }
                settings={
                    widget.settings
                }
                editMode={
                    editMode
                }
                canConfigure={
                    canConfigure
                }
                onSettingsChange={(
                    settings
                ) =>
                    onUpdateSettings(
                    widget.widgetKey,
                    widget.instanceKey,
                    settings
                    )
                }
                />
            </article>
          );
        }
      )}
    </div>
  );
}