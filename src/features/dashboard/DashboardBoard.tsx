import {
  useMemo,
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
  DashboardWidgetLayout,
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

import type {
  DashboardWidgetSettings,
} from "../widgets/layout/dashboardLayout.types";


function formatDayLabel(
  date:
    Date
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
  /**
   * Les nouveaux blocs F&B sont volontairement
   * créés en medium afin de pouvoir en afficher
   * plusieurs côte à côte.
   */
  if (
    definition.widgetKey ===
      "fnb_services" &&
    definition.sizes.includes(
      "medium"
    )
  ) {
    return "medium";
  }

  return definition.defaultSize;
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

  const defaultLayout =
    useMemo(
      () =>
        getDefaultDashboardLayout(
          viewport
        ),

      [
        viewport,
      ]
    );

  const {
    layout,

    loading:
      loadingLayout,

    saving,

    error:
      layoutError,

    commitLayout,

    reset,
  } =
    useDashboardLayout({
      hotelId,

      userId:
        user.id ||
        null,

      viewport,

      defaultLayout,
    });

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
              widgetDefinitions.find(
                (
                  item
                ) =>
                  item.widgetKey ===
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
    const next =
      layout.map(
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

    return commitLayout(
      next
    );
  }

  async function handleHide(
    widgetKey:
      string,

    instanceKey:
      string
  ) {
    const next =
      layout.map(
        (
          widget
        ) =>
          widget.widgetKey ===
            widgetKey &&
          widget.instanceKey ===
            instanceKey
            ? {
                ...widget,

                visible:
                  false,
              }
            : widget
      );

    return commitLayout(
      next
    );
  }

  async function handleAdd(
    definition:
      WidgetDefinition
  ) {
    const nextOrder =
      getNextOrder(
        layout
      );

    /**
     * =====================================================
     * MULTI-INSTANCE
     * =====================================================
     */
    if (
      definition.allowMultiple
    ) {
      const dimensions =
        definition
          .defaultLayout[
          viewport
        ];

      const instanceKey =
        crypto.randomUUID();

      const initialSize =
        getNewInstanceSize(
          definition
        );

      const nextWidget:
        DashboardWidgetLayout =
        {
          widgetKey:
            definition.widgetKey,

          instanceKey,

          x:
            0,

          y:
            nextOrder,

          w:
            dimensions.w,

          h:
            dimensions.h,

          visible:
            true,

          settings:
            definition.widgetKey ===
            "custom_board"
              ? {
                  size:
                    "medium",

                  title:
                    "Nouveau bloc",

                  eyebrow:
                    "PERSONNALISÉ",

                  density:
                    "compact",

                  showSubtitle:
                    true,

                  showValue:
                    true,

                  showCapacity:
                    true,

                  items:
                    [],
                }
              : {
                  size:
                    initialSize,

                  title:
                    definition.title,

                  serviceIds:
                    [],
                },
        };

      const success =
        await commitLayout([
          ...layout,

          nextWidget,
        ]);

      if (
        success
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
    const existing =
      layout.find(
        (
          widget
        ) =>
          widget.widgetKey ===
            definition.widgetKey &&
          widget.instanceKey ===
            "default"
      );

    if (
      existing
    ) {
      const next =
        layout.map(
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
                    nextOrder,
                }
              : widget
        );

      const success =
        await commitLayout(
          next
        );

      if (
        success
      ) {
        setGalleryOpen(
          false
        );
      }

      return;
    }

    const dimensions =
      definition
        .defaultLayout[
        viewport
      ];

    const nextWidget:
      DashboardWidgetLayout =
      {
        widgetKey:
          definition.widgetKey,

        instanceKey:
          "default",

        x:
          0,

        y:
          nextOrder,

        w:
          dimensions.w,

        h:
          dimensions.h,

        visible:
          true,

        settings: {
          size:
            definition.defaultSize,
        },
      };

    const success =
      await commitLayout([
        ...layout,

        nextWidget,
      ]);

    if (
      success
    ) {
      setGalleryOpen(
        false
      );
    }
  }

  const loading =
    loadingPermissions ||
    loadingLayout;

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
                    void reset()
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

        onAdd={(
          definition
        ) =>
          void handleAdd(
            definition
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