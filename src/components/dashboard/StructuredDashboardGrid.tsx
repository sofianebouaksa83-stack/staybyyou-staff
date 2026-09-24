import {
  GripVertical,
  Minus,
} from "lucide-react";

import {
  DashboardStack,
  type DashboardStackItem,
} from "./DashboardStack";

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

  canConfigure:
    boolean;
};

type DashboardRenderGroup = {
  id:
    string;

  widgets:
    DashboardWidgetLayout[];

  y:
    number;

  x:
    number;
};

function getWidgetIdentity(
  widget:
    DashboardWidgetLayout
) {
  return `${widget.widgetKey}:${widget.instanceKey}`;
}

function getGroupIdentity(
  widget:
    DashboardWidgetLayout
) {
  if (
    widget.stackId
  ) {
    return `stack:${widget.stackId}`;
  }

  return `widget:${getWidgetIdentity(
    widget
  )}`;
}

function getWidgetTitle(
  widget:
    DashboardWidgetLayout
) {
  const customTitle =
    widget.settings
      .title;

  if (
    typeof customTitle ===
      "string" &&
    customTitle.trim()
  ) {
    return customTitle;
  }

  const definition =
    widgetRegistry[
      widget.widgetKey as WidgetKey
    ];

  return (
    definition?.title ??
    "Bloc"
  );
}

function createRenderGroups(
  layout:
    DashboardWidgetLayout[]
): DashboardRenderGroup[] {
  const visible =
    layout.filter(
      (
        widget
      ) =>
        widget.visible &&
        STRUCTURED_WIDGETS.has(
          widget.widgetKey
        )
    );

  const groups =
    new Map<
      string,
      DashboardWidgetLayout[]
    >();

  for (
    const widget
    of visible
  ) {
    const groupId =
      getGroupIdentity(
        widget
      );

    const existing =
      groups.get(
        groupId
      );

    if (
      existing
    ) {
      existing.push(
        widget
      );

      continue;
    }

    groups.set(
      groupId,
      [
        widget,
      ]
    );
  }

  return Array.from(
    groups.entries()
  )
    .map(
      (
        [
          id,
          widgets,
        ]
      ) => {
        const orderedWidgets =
          [
            ...widgets,
          ].sort(
            (
              a,
              b
            ) =>
              a.stackOrder -
                b.stackOrder ||
              a.y -
                b.y ||
              a.x -
                b.x
          );

        return {
          id,

          widgets:
            orderedWidgets,

          y:
            Math.min(
              ...orderedWidgets.map(
                (
                  widget
                ) =>
                  widget.y
              )
            ),

          x:
            Math.min(
              ...orderedWidgets.map(
                (
                  widget
                ) =>
                  widget.x
              )
            ),
        };
      }
    )
    .sort(
      (
        a,
        b
      ) =>
        a.y -
          b.y ||
        a.x -
          b.x
    );
}

function getNextY(
  layout:
    DashboardWidgetLayout[]
) {
  const visible =
    layout.filter(
      (
        widget
      ) =>
        widget.visible
    );

  if (
    visible.length ===
    0
  ) {
    return 0;
  }

  return (
    Math.max(
      ...visible.map(
        (
          widget
        ) =>
          widget.y
      )
    ) + 1
  );
}

/**
 * Si une pile ne contient plus qu'un bloc,
 * elle n'a plus besoin d'exister.
 *
 * Sinon on remet stackOrder à 0, 1, 2...
 */
function normalizeStack(
  sourceLayout:
    DashboardWidgetLayout[],

  stackId:
    string | null
) {
  if (
    !stackId
  ) {
    return sourceLayout;
  }

  const members =
    sourceLayout
      .filter(
        (
          widget
        ) =>
          widget.stackId ===
          stackId
      )
      .sort(
        (
          a,
          b
        ) =>
          a.stackOrder -
          b.stackOrder
      );

  if (
    members.length ===
    0
  ) {
    return sourceLayout;
  }

  if (
    members.length ===
    1
  ) {
    const remainingId =
      getWidgetIdentity(
        members[0]
      );

    return sourceLayout.map(
      (
        widget
      ) =>
        getWidgetIdentity(
          widget
        ) ===
        remainingId
          ? {
              ...widget,

              stackId:
                null,

              stackOrder:
                0,
            }
          : widget
    );
  }

  const orderMap =
    new Map(
      members.map(
        (
          widget,
          index
        ) => [
          getWidgetIdentity(
            widget
          ),
          index,
        ]
      )
    );

  return sourceLayout.map(
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

        stackOrder:
          order,
      };
    }
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
  const groups =
    createRenderGroups(
      layout
    );

  function handleDrop(
    sourceGroupId:
      string,

    targetGroupId:
      string
  ) {
    if (
      !sourceGroupId ||
      sourceGroupId ===
        targetGroupId
    ) {
      return;
    }

    const groupIds =
      groups.map(
        (
          group
        ) =>
          group.id
      );

    const sourceIndex =
      groupIds.indexOf(
        sourceGroupId
      );

    const targetIndex =
      groupIds.indexOf(
        targetGroupId
      );

    if (
      sourceIndex < 0 ||
      targetIndex < 0
    ) {
      return;
    }

    const reordered =
      [
        ...groupIds,
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
            groupId,
            index
          ) => [
            groupId,
            index,
          ]
        )
      );

    const next =
      layout.map(
        (
          widget
        ) => {
          const groupId =
            getGroupIdentity(
              widget
            );

          const order =
            orderMap.get(
              groupId
            );

          if (
            order ===
            undefined
          ) {
            return widget;
          }

          return {
            ...widget,

            x:
              0,

            y:
              order,
          };
        }
      );

    void onCommit(
      next
    );
  }

  function handleStackWith(
    sourceWidget:
      DashboardWidgetLayout,

    targetGroupId:
      string
  ) {
    if (
      !targetGroupId
    ) {
      return;
    }

    const sourceId =
      getWidgetIdentity(
        sourceWidget
      );

    const sourceGroupId =
      getGroupIdentity(
        sourceWidget
      );

    if (
      sourceGroupId ===
      targetGroupId
    ) {
      return;
    }

    const targetGroup =
      groups.find(
        (
          group
        ) =>
          group.id ===
          targetGroupId
      );

    if (
      !targetGroup ||
      targetGroup.widgets.length ===
        0
    ) {
      return;
    }

    const targetWidget =
      targetGroup.widgets[
        0
      ];

    const previousStackId =
      sourceWidget.stackId;

    const targetStackId =
      targetWidget.stackId ??
      crypto.randomUUID();

    const currentTargetMembers =
      layout
        .filter(
          (
            widget
          ) =>
            widget.stackId ===
            targetStackId
        );

    const nextStackOrder =
      targetWidget.stackId
        ? (
            currentTargetMembers.length >
            0
              ? Math.max(
                  ...currentTargetMembers.map(
                    (
                      widget
                    ) =>
                      widget.stackOrder
                  )
                ) + 1
              : 1
          )
        : 1;

    let next =
      layout.map(
        (
          widget
        ) => {
          const identity =
            getWidgetIdentity(
              widget
            );

          /**
           * Bloc qu'on ajoute à la pile.
           */
          if (
            identity ===
            sourceId
          ) {
            return {
              ...widget,

              stackId:
                targetStackId,

              stackOrder:
                nextStackOrder,

              x:
                targetWidget.x,

              y:
                targetWidget.y,

              w:
                targetWidget.w,

              h:
                targetWidget.h,
            };
          }

          /**
           * Le bloc cible n'avait pas encore
           * de pile : il en devient le premier.
           */
          if (
            identity ===
              getWidgetIdentity(
                targetWidget
              ) &&
            !targetWidget.stackId
          ) {
            return {
              ...widget,

              stackId:
                targetStackId,

              stackOrder:
                0,
            };
          }

          /**
           * Si la cible appartient déjà à une pile,
           * tous ses membres utilisent exactement
           * le même emplacement.
           */
          if (
            widget.stackId ===
            targetStackId
          ) {
            return {
              ...widget,

              x:
                targetWidget.x,

              y:
                targetWidget.y,

              w:
                targetWidget.w,

              h:
                targetWidget.h,
            };
          }

          return widget;
        }
      );

    /**
     * Si le bloc venait d'une autre pile,
     * on nettoie cette ancienne pile.
     */
    if (
      previousStackId &&
      previousStackId !==
        targetStackId
    ) {
      next =
        normalizeStack(
          next,
          previousStackId
        );
    }

    next =
      normalizeStack(
        next,
        targetStackId
      );

    void onCommit(
      next
    );
  }

  function handleRemoveFromStack(
    sourceWidget:
      DashboardWidgetLayout
  ) {
    if (
      !sourceWidget.stackId
    ) {
      return;
    }

    const sourceId =
      getWidgetIdentity(
        sourceWidget
      );

    const previousStackId =
      sourceWidget.stackId;

    const nextY =
      getNextY(
        layout
      );

    let next =
      layout.map(
        (
          widget
        ) =>
          getWidgetIdentity(
            widget
          ) ===
          sourceId
            ? {
                ...widget,

                stackId:
                  null,

                stackOrder:
                  0,

                x:
                  0,

                y:
                  nextY,
              }
            : widget
      );

    next =
      normalizeStack(
        next,
        previousStackId
      );

    void onCommit(
      next
    );
  }

  function renderWidget(
    widget:
      DashboardWidgetLayout
  ) {
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


    return (
      <div
        className="structured-dashboard-slide-content"
      >
        <Component
          size={
            size
          }
          data={
            data
          }
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
      </div>
    );
  }

  if (
    groups.length ===
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
      className={[
        "structured-dashboard-grid",

        editMode
          ? "structured-dashboard-grid--editing"
          : "",
      ].join(
        " "
      )}
    >
      {groups.map(
        (
          group
        ) => {
          const firstWidget =
            group.widgets[
              0
            ];

          if (
            !firstWidget
          ) {
            return null;
          }

          const definition =
            widgetRegistry[
              firstWidget.widgetKey as WidgetKey
            ];

          if (
            !definition
          ) {
            return null;
          }

          const size =
            getWidgetSize(
              firstWidget,
              definition
            );

          const stackItems:
            DashboardStackItem[] =
            group.widgets.flatMap(
              (
                widget
              ) => {
                const widgetDefinition =
                  widgetRegistry[
                    widget.widgetKey as WidgetKey
                  ];

                if (
                  !widgetDefinition
                ) {
                  return [];
                }

                const content =
                  renderWidget(
                    widget
                  );

                if (
                  !content
                ) {
                  return [];
                }

                return [
                  {
                    id:
                      getWidgetIdentity(
                        widget
                      ),

                    title:
                      getWidgetTitle(
                        widget
                      ),

                    content,
                  },
                ];
              }
            );

          return (
            <article
              key={
                group.id
              }
              className={[
                "structured-dashboard-block",

                group.widgets.length >
                1
                  ? "structured-dashboard-block--stack"
                  : `structured-dashboard-block--${firstWidget.widgetKey}`,

                `structured-dashboard-block--size-${size}`,
              ].join(
                " "
              )}
              style={{
                gridColumn: `span ${Math.min(
                  12,
                  Math.max(
                    1,
                    firstWidget.w
                  )
                )}`,
              }}
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

                const sourceGroupId =
                  event.dataTransfer.getData(
                    "text/dashboard-group"
                  );

                handleDrop(
                  sourceGroupId,
                  group.id
                );
              }}
            >
              {editMode && (
  <div className="structured-dashboard-group-toolbar">
    <span
      className="structured-dashboard-drag"
      draggable
      onDragStart={(
        event
      ) => {
        event.dataTransfer.setData(
          "text/dashboard-group",
          group.id
        );

        event.dataTransfer.effectAllowed =
          "move";
      }}
    >
      <GripVertical
        size={16}
      />

      {group.widgets.length > 1
        ? "Déplacer la pile"
        : "Déplacer"}
    </span>

    <span className="structured-dashboard-edit-title">
      {group.widgets.length > 1
        ? `${group.widgets.length} blocs`
        : getWidgetTitle(
            firstWidget
          )}
    </span>

    <div className="structured-dashboard-stack-actions">
      <select
        className="structured-dashboard-stack-select"
        value=""
        onChange={(
          event
        ) => {
          const target =
            event.target.value;

          if (
            !target
          ) {
            return;
          }

          handleStackWith(
            firstWidget,
            target
          );

          event.target.value =
            "";
        }}
      >
        <option value="">
          Empiler avec…
        </option>

        {groups
          .filter(
            (
              target
            ) =>
              target.id !==
              group.id
          )
          .map(
            (
              targetGroup
            ) => {
              const targetFirst =
                targetGroup.widgets[
                  0
                ];

              if (
                !targetFirst
              ) {
                return null;
              }

              return (
                <option
                  key={
                    targetGroup.id
                  }
                  value={
                    targetGroup.id
                  }
                >
                  {getWidgetTitle(
                    targetFirst
                  )}
                </option>
              );
            }
          )}
      </select>

      {group.widgets.length >
        1 && (
        <button
          type="button"
          className="structured-dashboard-unstack"
          onClick={() =>
            handleRemoveFromStack(
              firstWidget
            )
          }
        >
          Retirer
        </button>
      )}

      <button
        type="button"
        title="Masquer"
        onClick={() =>
          void onHide(
            firstWidget.widgetKey,
            firstWidget.instanceKey
          )
        }
      >
        <Minus
          size={15}
        />
      </button>
    </div>
  </div>
)}
              <DashboardStack
                items={
                  stackItems
                }
              />
            </article>
          );
        }
      )}
    </div>
  );
}