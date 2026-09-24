import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Plus,
  RotateCcw,
  Settings2,
} from "lucide-react";

import {
  useApp,
} from "../../app/AppContext";

import {
  StructuredDashboardGrid,
} from "../../components/dashboard/StructuredDashboardGrid";

import {
  WidgetGallery,
} from "../../components/dashboard/WidgetGallery";

import {
  DashboardStats,
} from "./DashboardStats";

import {
  getDefaultDashboardLayout,
} from "../widgets/layout/dashboardLayout.defaults";

import type {
  DashboardViewport,
  DashboardWidgetLayout,
  DashboardWidgetSettings,
  WidgetSize,
} from "../widgets/layout/dashboardLayout.types";

import {
  useDashboardLayout,
} from "../widgets/layout/useDashboardLayout";

import {
  useDashboardViewport,
} from "../widgets/layout/useDashboardViewport";

import {
  widgetDefinitions,
} from "../widgets/registry/widgetRegistry";

import type {
  DashboardWidgetData,
  WidgetDefinition,
} from "../widgets/registry/widgetRegistry.types";

import {
  useWidgetPermissions,
} from "../widgets/registry/useWidgetPermissions";

import {
  useRoomServiceWidgetsData,
} from "../widgets/room-service/useRoomServiceWidgetsData";

import {
  useDashboard,
} from "./useDashboard";

import {
  useFnbDashboardData,
} from "../widgets/fnb/useFnbDashboardData";

import {
  createCustomBoardPresetSettings,
  customBoardPresets,
  type CustomBoardPreset,
} from "../widgets/custom-board/customBoard.presets";

function formatDayLabel(
  date: Date
) {
  return date
    .toLocaleDateString(
      "fr-FR",
      {
        weekday:
          "long",

        day:
          "numeric",

        month:
          "long",
      }
    )
    .toUpperCase();
}

const STRUCTURED_WIDGET_KEYS =
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

function getWidgetIdentity(
  widget:
    DashboardWidgetLayout
) {
  return `${widget.widgetKey}:${widget.instanceKey}`;
}

function getNextOrder(
  layout:
    DashboardWidgetLayout[]
) {
  const structured =
    layout.filter(
      (
        widget
      ) =>
        widget.visible &&
        STRUCTURED_WIDGET_KEYS.has(
          widget.widgetKey
        )
    );

  if (
    structured.length ===
    0
  ) {
    return 0;
  }

  return (
    Math.max(
      ...structured.map(
        (
          widget
        ) =>
          widget.y
      )
    ) + 1
  );
}

function getNewInstanceSize(
  definition:
    WidgetDefinition
): WidgetSize {
  return definition.defaultSize;
}

function getWidgetDefinition(
  widgetKey:
    string
) {
  return widgetDefinitions.find(
    (
      definition
    ) =>
      definition.widgetKey ===
      widgetKey
  );
}

function isSupportedWidget(
  widget:
    DashboardWidgetLayout
) {
  return (
    STRUCTURED_WIDGET_KEYS.has(
      widget.widgetKey
    ) &&
    Boolean(
      getWidgetDefinition(
        widget.widgetKey
      )
    )
  );
}

function cloneWidgetForViewport(
  widget:
    DashboardWidgetLayout,

  viewport:
    DashboardViewport,

  targetLayout:
    DashboardWidgetLayout[]
): DashboardWidgetLayout | null {
  const definition =
    getWidgetDefinition(
      widget.widgetKey
    );

  if (
    !definition ||
    !STRUCTURED_WIDGET_KEYS.has(
      widget.widgetKey
    )
  ) {
    return null;
  }

  const dimensions =
    definition
      .defaultLayout[
        viewport
      ];

  return {
    ...widget,

    id:
      undefined,

    x:
      0,

    y:
      getNextOrder(
        targetLayout
      ),

    w:
      dimensions.w,

    h:
      dimensions.h,
    
    stackId:
      null,

    stackOrder:
      0,  

    settings: {
      ...widget.settings,
    },
  };
}

function sameSettings(
  a:
    DashboardWidgetSettings,

  b:
    DashboardWidgetSettings
) {
  return (
    JSON.stringify(a) ===
    JSON.stringify(b)
  );
}

function reconcileLayouts(
  desktopLayout:
    DashboardWidgetLayout[],

  mobileLayout:
    DashboardWidgetLayout[]
) {
  const desktopNext = [
    ...desktopLayout,
  ];

  const mobileNext = [
    ...mobileLayout,
  ];

  const desktopMap =
    new Map(
      desktopNext.map(
        (
          widget
        ) => [
          getWidgetIdentity(
            widget
          ),
          widget,
        ]
      )
    );

  const mobileMap =
    new Map(
      mobileNext.map(
        (
          widget
        ) => [
          getWidgetIdentity(
            widget
          ),
          widget,
        ]
      )
    );

  const identities =
    new Set([
      ...desktopMap.keys(),
      ...mobileMap.keys(),
    ]);

  let desktopChanged =
    false;

  let mobileChanged =
    false;

  for (
    const identity
    of identities
  ) {
    const desktopWidget =
      desktopMap.get(
        identity
      );

    const mobileWidget =
      mobileMap.get(
        identity
      );

    const sourceWidget =
      desktopWidget ??
      mobileWidget;

    if (
      !sourceWidget ||
      !isSupportedWidget(
        sourceWidget
      )
    ) {
      continue;
    }

    /**
     * -----------------------------------------
     * BLOC ABSENT SUR DESKTOP
     * -----------------------------------------
     */
    if (
      !desktopWidget &&
      mobileWidget
    ) {
      const cloned =
        cloneWidgetForViewport(
          mobileWidget,
          "desktop",
          desktopNext
        );

      if (
        cloned
      ) {
        desktopNext.push(
          cloned
        );

        desktopMap.set(
          identity,
          cloned
        );

        desktopChanged =
          true;
      }

      continue;
    }

    /**
     * -----------------------------------------
     * BLOC ABSENT SUR MOBILE
     * -----------------------------------------
     */
    if (
      desktopWidget &&
      !mobileWidget
    ) {
      const cloned =
        cloneWidgetForViewport(
          desktopWidget,
          "mobile",
          mobileNext
        );

      if (
        cloned
      ) {
        mobileNext.push(
          cloned
        );

        mobileMap.set(
          identity,
          cloned
        );

        mobileChanged =
          true;
      }

      continue;
    }

    if (
      !desktopWidget ||
      !mobileWidget
    ) {
      continue;
    }

    /**
     * -----------------------------------------
     * VISIBILITÉ COMMUNE
     *
     * Pour la migration initiale :
     * si le bloc est visible sur au moins
     * un viewport, on le garde visible partout.
     * -----------------------------------------
     */
    const sharedVisible =
      desktopWidget.visible ||
      mobileWidget.visible;

    /**
     * -----------------------------------------
     * SETTINGS COMMUNS
     *
     * On privilégie le settings le plus riche.
     * Cela évite de remplacer un CustomBoard
     * configuré par un simple settings vide.
     * -----------------------------------------
     */
    const desktopSettingsSize =
      JSON.stringify(
        desktopWidget.settings
      ).length;

    const mobileSettingsSize =
      JSON.stringify(
        mobileWidget.settings
      ).length;

    const sharedSettings =
      desktopSettingsSize >=
      mobileSettingsSize
        ? desktopWidget.settings
        : mobileWidget.settings;

    const desktopIndex =
      desktopNext.findIndex(
        (
          widget
        ) =>
          getWidgetIdentity(
            widget
          ) ===
          identity
      );

    const mobileIndex =
      mobileNext.findIndex(
        (
          widget
        ) =>
          getWidgetIdentity(
            widget
          ) ===
          identity
      );

    if (
      desktopWidget.visible !==
        sharedVisible ||
      !sameSettings(
        desktopWidget.settings,
        sharedSettings
      )
    ) {
      desktopNext[
        desktopIndex
      ] = {
        ...desktopWidget,

        visible:
          sharedVisible,

        settings: {
          ...sharedSettings,
        },
      };

      desktopChanged =
        true;
    }

    if (
      mobileWidget.visible !==
        sharedVisible ||
      !sameSettings(
        mobileWidget.settings,
        sharedSettings
      )
    ) {
      mobileNext[
        mobileIndex
      ] = {
        ...mobileWidget,

        visible:
          sharedVisible,

        settings: {
          ...sharedSettings,
        },
      };

      mobileChanged =
        true;
    }
  }

  return {
    desktopChanged,

    mobileChanged,

    desktopLayout:
      desktopNext,

    mobileLayout:
      mobileNext,
  };
}

function updateWidgetSettings(
  sourceLayout:
    DashboardWidgetLayout[],

  widgetKey:
    string,

  instanceKey:
    string,

  nextSettings:
    DashboardWidgetSettings
) {
  return sourceLayout.map(
    (
      widget
    ) =>
      widget.widgetKey ===
        widgetKey &&
      widget.instanceKey ===
        instanceKey
        ? {
            ...widget,

            settings: {
              ...widget.settings,
              ...nextSettings,
            },
          }
        : widget
  );
}

function updateWidgetVisibility(
  sourceLayout:
    DashboardWidgetLayout[],

  widgetKey:
    string,

  instanceKey:
    string,

  visible:
    boolean
) {
  return sourceLayout.map(
    (
      widget
    ) =>
      widget.widgetKey ===
        widgetKey &&
      widget.instanceKey ===
        instanceKey
        ? {
            ...widget,

            visible,
          }
        : widget
  );
}

function createWidgetForViewport({
  definition,
  viewport,
  layout,
  instanceKey,
  settings,
}: {
  definition:
    WidgetDefinition;

  viewport:
    DashboardViewport;

  layout:
    DashboardWidgetLayout[];

  instanceKey:
    string;

  settings:
    DashboardWidgetSettings;
}): DashboardWidgetLayout {
  const dimensions =
    definition
      .defaultLayout[
        viewport
      ];

  return {
    widgetKey:
      definition.widgetKey,

    instanceKey,

    x:
      0,

    y:
      getNextOrder(
        layout
      ),

    w:
      dimensions.w,

    h:
      dimensions.h,

    visible:
      true,

    stackId:
      null,

    stackOrder:
      0,  

    settings: {
      ...settings,
    },
  };
}

export function DashboardBoard() {
  const {
    hotelId,
    user,
  } =
    useApp();

  const viewport =
    useDashboardViewport();

  const {
    permissions,

    loading:
      loadingPermissions,

    can,
  } =
    useWidgetPermissions(
      hotelId
    );

  const canViewHotel =
    permissions.has(
      "hotel.view"
    );

  const canViewTasks =
    permissions.has(
      "tasks.view"
    );

  const canManageDashboard =
    permissions.has(
      "dashboard.manage"
    );

  const {
    selectedDate,

    openTasks,
    dashboardTasks,

    rooms,

    arrivals,
    departures,
    inHouse,

    activeFollowups,
    urgentFollowups,

    loadingTasks,
    loadingHotel,

    tasksError,
    hotelError,
  } =
    useDashboard({
      loadHotel:
        !loadingPermissions &&
        canViewHotel,

      loadTasks:
        !loadingPermissions &&
        canViewTasks,
    });

  const fnb =
    useFnbDashboardData(
      hotelId,
      selectedDate,
      !loadingPermissions &&
        permissions.has(
          "fnb.view"
        )
    );

  const roomService =
    useRoomServiceWidgetsData(
      hotelId,
      !loadingPermissions &&
        permissions.has(
          "orders.view"
        )
    );

  const desktopDefaultLayout =
    useMemo(
      () =>
        getDefaultDashboardLayout(
          "desktop"
        ),
      []
    );

  const mobileDefaultLayout =
    useMemo(
      () =>
        getDefaultDashboardLayout(
          "mobile"
        ),
      []
    );

  const desktopDashboard =
    useDashboardLayout({
      hotelId,

      userId:
        user.id ||
        null,

      viewport:
        "desktop",

      defaultLayout:
        desktopDefaultLayout,
    });

  const mobileDashboard =
    useDashboardLayout({
      hotelId,

      userId:
        user.id ||
        null,

      viewport:
        "mobile",

      defaultLayout:
        mobileDefaultLayout,
    });

  const currentDashboard =
    viewport ===
      "desktop"
      ? desktopDashboard
      : mobileDashboard;

  const {
    layout,

    loading:
      loadingLayout,

    commitLayout,
  } =
    currentDashboard;

  const saving =
    desktopDashboard.saving ||
    mobileDashboard.saving;

  const layoutError =
    desktopDashboard.error ||
    mobileDashboard.error;

  const migrationRunning =
    useRef(
      false
    );

  useEffect(
  () => {
    if (
      loadingPermissions ||
      desktopDashboard.loading ||
      mobileDashboard.loading ||
      desktopDashboard.saving ||
      mobileDashboard.saving ||
      migrationRunning.current
    ) {
      return;
    }

    const result =
      reconcileLayouts(
        desktopDashboard.layout,
        mobileDashboard.layout
      );

    if (
      !result.desktopChanged &&
      !result.mobileChanged
    ) {
      return;
    }

    migrationRunning.current =
      true;

    void Promise.all([
      result.desktopChanged
        ? desktopDashboard.commitLayout(
            result.desktopLayout
          )
        : Promise.resolve(
            true
          ),

      result.mobileChanged
        ? mobileDashboard.commitLayout(
            result.mobileLayout
          )
        : Promise.resolve(
            true
          ),
    ]).finally(
      () => {
        migrationRunning.current =
          false;
      }
    );
  },
  [
    loadingPermissions,

    desktopDashboard.loading,
    desktopDashboard.saving,
    desktopDashboard.layout,

    mobileDashboard.loading,
    mobileDashboard.saving,
    mobileDashboard.layout,
  ]
);
  const [
    editMode,
    setEditMode,
  ] =
    useState(
      false
    );

  const [
    galleryOpen,
    setGalleryOpen,
  ] =
    useState(
      false
    );

  const galleryWidgets =
    useMemo(
      () =>
        widgetDefinitions.filter(
          (
            definition
          ) =>
            STRUCTURED_WIDGET_KEYS.has(
              definition.widgetKey
            ) &&
            definition.widgetKey !==
              "custom_board" &&
            can(
              definition.permission
            )
        ),
      [
        can,
      ]
    );

  const allowedLayout =
    useMemo(
      () =>
        layout.filter(
          (
            widget
          ) => {
            if (
              !STRUCTURED_WIDGET_KEYS.has(
                widget.widgetKey
              )
            ) {
              return false;
            }

            const definition =
              getWidgetDefinition(
                widget.widgetKey
              );

            if (
              !definition
            ) {
              return false;
            }

            return can(
              definition.permission
            );
          }
        ),
      [
        layout,
        can,
      ]
    );

  const activeKeys =
    useMemo(
      () =>
        new Set(
          allowedLayout
            .filter(
              (
                widget
              ) =>
                widget.visible
            )
            .map(
              (
                widget
              ) =>
                widget.widgetKey
            )
        ),
      [
        allowedLayout,
      ]
    );

  const repeatableKeys =
    useMemo(
      () =>
        new Set(
          galleryWidgets
            .filter(
              (
                widget
              ) =>
                widget.allowMultiple
            )
            .map(
              (
                widget
              ) =>
                widget.widgetKey
            )
        ),
      [
        galleryWidgets,
      ]
    );

  const roomCount =
    rooms.filter(
      (
        room
      ) =>
        room.active
    ).length;

  const occupancyRate =
    roomCount >
    0
      ? Math.round(
          (
            inHouse.length /
            roomCount
          ) *
            100
        )
      : 0;

  const widgetData:
    DashboardWidgetData =
    {
      arrivalsCount:
        arrivals.length,

      departuresCount:
        departures.length,

      inHouseCount:
        inHouse.length,

      roomCount,

      occupancyRate,

      followupsCount:
        activeFollowups.length,

      urgentFollowupsCount:
        urgentFollowups.length,

      openTasksCount:
        openTasks.length,

      dashboardTasks,

      loadingHotel,

      loadingTasks,

      hotelError,

      tasksError,

      fnbSummary: {
        reservations:
          fnb.reservations,

        capacity:
          fnb.capacity,

        loading:
          fnb.loading,

        error:
          fnb.error,
      },

      fnb: {
        services:
          fnb.services,

        loading:
          fnb.loading,

        error:
          fnb.error,

        updateReservations:
          fnb.updateReservations,
      },

      roomService,
    };

  async function handleUpdateSettings(
    widgetKey:
      string,

    instanceKey:
      string,

    nextSettings:
      DashboardWidgetSettings
  ) {
    const desktopNext =
      updateWidgetSettings(
        desktopDashboard.layout,
        widgetKey,
        instanceKey,
        nextSettings
      );

    const mobileNext =
      updateWidgetSettings(
        mobileDashboard.layout,
        widgetKey,
        instanceKey,
        nextSettings
      );

    const [
      desktopSuccess,
      mobileSuccess,
    ] =
      await Promise.all([
        desktopDashboard.commitLayout(
          desktopNext
        ),

        mobileDashboard.commitLayout(
          mobileNext
        ),
      ]);

    return (
      desktopSuccess &&
      mobileSuccess
    );
  }

  async function handleHide(
    widgetKey:
      string,

    instanceKey:
      string
  ) {
    const desktopNext =
      updateWidgetVisibility(
        desktopDashboard.layout,
        widgetKey,
        instanceKey,
        false
      );

    const mobileNext =
      updateWidgetVisibility(
        mobileDashboard.layout,
        widgetKey,
        instanceKey,
        false
      );

    const [
      desktopSuccess,
      mobileSuccess,
    ] =
      await Promise.all([
        desktopDashboard.commitLayout(
          desktopNext
        ),

        mobileDashboard.commitLayout(
          mobileNext
        ),
      ]);

    return (
      desktopSuccess &&
      mobileSuccess
    );
  }

  async function handleAdd(
    definition:
      WidgetDefinition
  ) {
    /**
     * =====================================================
     * MULTI-INSTANCE
     * =====================================================
     */
    if (
      definition.allowMultiple
    ) {
      const instanceKey =
        crypto.randomUUID();

      const initialSize =
        getNewInstanceSize(
          definition
        );

      const settings:
        DashboardWidgetSettings =
        definition.widgetKey ===
        "custom_board"
          ? createCustomBoardPresetSettings(
              "blank"
            )
          : {
              size:
                initialSize,

              title:
                definition.title,

              serviceIds:
                [],
            };

      const desktopWidget =
        createWidgetForViewport({
          definition,
          viewport:
            "desktop",
          layout:
            desktopDashboard.layout,
          instanceKey,
          settings,
        });

      const mobileWidget =
        createWidgetForViewport({
          definition,
          viewport:
            "mobile",
          layout:
            mobileDashboard.layout,
          instanceKey,
          settings,
        });

      const [
        desktopSuccess,
        mobileSuccess,
      ] =
        await Promise.all([
          desktopDashboard.commitLayout([
            ...desktopDashboard.layout,
            desktopWidget,
          ]),

          mobileDashboard.commitLayout([
            ...mobileDashboard.layout,
            mobileWidget,
          ]),
        ]);

      if (
        desktopSuccess &&
        mobileSuccess
      ) {
        setGalleryOpen(
          false
        );
      }

      return;
    }

    /**
     * =====================================================
     * WIDGET CLASSIQUE
     * =====================================================
     */
    const desktopExisting =
      desktopDashboard.layout.find(
        (
          widget
        ) =>
          widget.widgetKey ===
            definition.widgetKey &&
          widget.instanceKey ===
            "default"
      );

    const mobileExisting =
      mobileDashboard.layout.find(
        (
          widget
        ) =>
          widget.widgetKey ===
            definition.widgetKey &&
          widget.instanceKey ===
            "default"
      );

    const baseSettings:
      DashboardWidgetSettings =
      desktopExisting?.settings ??
      mobileExisting?.settings ??
      {
        size:
          definition.defaultSize,
      };

    const desktopNext =
      desktopExisting
        ? desktopDashboard.layout.map(
            (
              widget
            ) =>
              widget.widgetKey ===
                  definition.widgetKey &&
                widget.instanceKey ===
                  "default"
                ? {
                    ...widget,

                    visible:
                      true,

                    x:
                      0,

                    y:
                      getNextOrder(
                        desktopDashboard.layout
                      ),

                    settings: {
                      ...widget.settings,
                      ...baseSettings,
                    },
                  }
                : widget
          )
        : [
            ...desktopDashboard.layout,

            createWidgetForViewport({
              definition,
              viewport:
                "desktop",
              layout:
                desktopDashboard.layout,
              instanceKey:
                "default",
              settings:
                baseSettings,
            }),
          ];

    const mobileNext =
      mobileExisting
        ? mobileDashboard.layout.map(
            (
              widget
            ) =>
              widget.widgetKey ===
                  definition.widgetKey &&
                widget.instanceKey ===
                  "default"
                ? {
                    ...widget,

                    visible:
                      true,

                    x:
                      0,

                    y:
                      getNextOrder(
                        mobileDashboard.layout
                      ),

                    settings: {
                      ...widget.settings,
                      ...baseSettings,
                    },
                  }
                : widget
          )
        : [
            ...mobileDashboard.layout,

            createWidgetForViewport({
              definition,
              viewport:
                "mobile",
              layout:
                mobileDashboard.layout,
              instanceKey:
                "default",
              settings:
                baseSettings,
            }),
          ];

    const [
      desktopSuccess,
      mobileSuccess,
    ] =
      await Promise.all([
        desktopDashboard.commitLayout(
          desktopNext
        ),

        mobileDashboard.commitLayout(
          mobileNext
        ),
      ]);

    if (
      desktopSuccess &&
      mobileSuccess
    ) {
      setGalleryOpen(
        false
      );
    }
  }

  async function handleAddCustomBoardPreset(
    preset:
      CustomBoardPreset
  ) {
    const definition =
      getWidgetDefinition(
        "custom_board"
      );

    if (
      !definition
    ) {
      return;
    }

    const settings =
      createCustomBoardPresetSettings(
        preset.key
      );

    const instanceKey =
      crypto.randomUUID();

    const desktopWidget =
      createWidgetForViewport({
        definition,
        viewport:
          "desktop",
        layout:
          desktopDashboard.layout,
        instanceKey,
        settings,
      });

    const mobileWidget =
      createWidgetForViewport({
        definition,
        viewport:
          "mobile",
        layout:
          mobileDashboard.layout,
        instanceKey,
        settings,
      });

    const [
      desktopSuccess,
      mobileSuccess,
    ] =
      await Promise.all([
        desktopDashboard.commitLayout([
          ...desktopDashboard.layout,
          desktopWidget,
        ]),

        mobileDashboard.commitLayout([
          ...mobileDashboard.layout,
          mobileWidget,
        ]),
      ]);

    if (
      desktopSuccess &&
      mobileSuccess
    ) {
      setGalleryOpen(
        false
      );
    }
  }

  async function handleReset() {
    const [
      desktopSuccess,
      mobileSuccess,
    ] =
      await Promise.all([
        desktopDashboard.reset(),
        mobileDashboard.reset(),
      ]);

    if (
      desktopSuccess &&
      mobileSuccess
    ) {
      setGalleryOpen(
        false
      );
    }

    return (
      desktopSuccess &&
      mobileSuccess
    );
  }

  const loading =
    loadingPermissions ||
    loadingLayout ||
    desktopDashboard.loading ||
    mobileDashboard.loading;

  return (
    <div className="dashboard-board">
      <div className="dashboard-custom__header">
        <div className="welcome">
          <span className="eyebrow">
            {formatDayLabel(
              selectedDate
            )}
          </span>

          <h1>
            Bonjour{" "}
            {
              user.firstName
            }
          </h1>

          <p>
            Voici l'essentiel
            pour votre journée.
          </p>
        </div>

        {canManageDashboard && (
          <div className="dashboard-custom__actions">
            {editMode ? (
              <>
                <button
                  type="button"
                  className="dashboard-action dashboard-action--ghost"
                  disabled={
                    saving
                  }
                  onClick={() =>
                    void handleReset()
                  }
                >
                  <RotateCcw
                    size={
                      16
                    }
                  />

                  Réinitialiser
                </button>

                <button
                  type="button"
                  className="dashboard-action dashboard-action--ghost"
                  onClick={() =>
                    setGalleryOpen(
                      true
                    )
                  }
                >
                  <Plus
                    size={
                      16
                    }
                  />

                  Ajouter un bloc
                </button>

                <button
                  type="button"
                  className="dashboard-action dashboard-action--primary"
                  onClick={() => {
                    setGalleryOpen(
                      false
                    );

                    setEditMode(
                      false
                    );
                  }}
                >
                  Terminé
                </button>
              </>
            ) : (
              <button
                type="button"
                className="dashboard-action dashboard-action--ghost"
                onClick={() =>
                  setEditMode(
                    true
                  )
                }
              >
                <Settings2
                  size={
                    16
                  }
                />

                Personnaliser
              </button>
            )}
          </div>
        )}
      </div>

      <DashboardStats
        arrivalsCount={
          arrivals.length
        }

        inHouseCount={
          inHouse.length
        }

        departuresCount={
          departures.length
        }

        followupsCount={
          activeFollowups.length
        }

        urgentFollowupsCount={
          urgentFollowups.length
        }

        openTasksCount={
          openTasks.length
        }

        loadingHotel={
          loadingHotel
        }

        loadingTasks={
          loadingTasks
        }
      />

      {(hotelError ||
        layoutError) && (
        <div className="dashboard-custom__feedback">
          {hotelError ||
            layoutError}
        </div>
      )}

      {saving && (
        <div className="dashboard-custom__saving">
          Enregistrement…
        </div>
      )}

      {!loading && (
        <StructuredDashboardGrid
          layout={
            allowedLayout
          }
          data={
            widgetData
          }
          editMode={
            editMode
          }
          canConfigure={
            canManageDashboard
          }
          onCommit={
            commitLayout
          }
          onHide={
            handleHide
          }
          onUpdateSettings={
            handleUpdateSettings
          }
        />
      )}

      <WidgetGallery
        open={
          galleryOpen
        }

        widgets={
          galleryWidgets
        }

        activeKeys={
          activeKeys
        }

        repeatableKeys={
          repeatableKeys
        }

        customBoardPresets={
          customBoardPresets
        }

        onAdd={(
          definition
        ) =>
          void handleAdd(
            definition
          )
        }

        onAddCustomBoardPreset={(
          preset
        ) =>
          void handleAddCustomBoardPreset(
            preset
          )
        }

        onClose={() =>
          setGalleryOpen(
            false
          )
        }
      />
    </div>
  );
}
