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
  DashboardGrid,
} from "../../components/dashboard/DashboardGrid";
import {
  WidgetGallery,
} from "../../components/dashboard/WidgetGallery";
import {
  getDefaultDashboardLayout,
} from "../widgets/layout/dashboardLayout.defaults";
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

function formatDayLabel(
  date: Date
) {
  return date
    .toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    )
    .toUpperCase();
}

export function DashboardBoard() {
  const {
    hotelId,
    user,
  } = useApp();

  const viewport =
    useDashboardViewport();

  const {
    permissions,
    loading:
      loadingPermissions,
    can,
  } = useWidgetPermissions(
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
    arrivals,
    departures,
    inHouse,
    activeFollowups,
    urgentFollowups,
    loadingTasks,
    loadingHotel,
    tasksError,
    hotelError,
  } = useDashboard({
    loadHotel:
      !loadingPermissions &&
      canViewHotel,
    loadTasks:
      !loadingPermissions &&
      canViewTasks,
  });

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
      [viewport]
    );

  const {
    layout,
    loading:
      loadingLayout,
    saving,
    error: layoutError,
    updateLocalLayout,
    commitLayout,
    hideWidget,
    showWidget,
    reset,
  } = useDashboardLayout({
    hotelId,
    userId:
      user.id || null,
    viewport,
    defaultLayout,
  });

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [
    galleryOpen,
    setGalleryOpen,
  ] = useState(false);

  const allowedDefinitions =
    useMemo(
      () =>
        widgetDefinitions.filter(
          (definition) =>
            can(
              definition.permission
            )
        ),
      [permissions]
    );

  const allowedKeys =
    useMemo(
      () =>
        new Set(
          allowedDefinitions.map(
            (definition) =>
              definition.widgetKey
          )
        ),
      [allowedDefinitions]
    );

  const visibleLayout =
    useMemo(
      () =>
        layout.filter(
          (widget) =>
            widget.visible &&
            allowedKeys.has(
              widget.widgetKey
            )
        ),
      [
        layout,
        allowedKeys,
      ]
    );

  const activeKeys =
    useMemo(
      () =>
        new Set(
          visibleLayout.map(
            (widget) =>
              widget.widgetKey
          )
        ),
      [visibleLayout]
    );

  const widgetData = {
    arrivalsCount:
      arrivals.length,
    departuresCount:
      departures.length,
    inHouseCount:
      inHouse.length,
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
    roomService,
  };

  function buildWidgetLayout(
    definition:
      WidgetDefinition
  ) {
    const dimensions =
      definition
        .defaultLayout[
        viewport
      ];

    const nextY =
      layout.reduce(
        (
          max,
          widget
        ) =>
          Math.max(
            max,
            widget.y +
              widget.h
          ),
        0
      );

    return {
      widgetKey:
        definition.widgetKey,
      x: 0,
      y: nextY,
      w: dimensions.w,
      h: dimensions.h,
      visible: true,
      settings: {
        size:
          definition.defaultSize,
      },
    };
  }

  function mergeVisibleLayout(
    nextVisible:
      typeof visibleLayout
  ) {
    const nextByKey =
      new Map(
        nextVisible.map(
          (widget) => [
            widget.widgetKey,
            widget,
          ]
        )
      );

    return layout.map(
      (widget) =>
        nextByKey.get(
          widget.widgetKey
        ) ?? widget
    );
  }

  function handleLocalGridChange(
    nextVisible:
      typeof visibleLayout
  ) {
    updateLocalLayout(
      mergeVisibleLayout(
        nextVisible
      )
    );
  }

  async function handleGridCommit(
    nextVisible:
      typeof visibleLayout
  ) {
    return commitLayout(
      mergeVisibleLayout(
        nextVisible
      )
    );
  }

  async function handleAdd(
    definition:
      WidgetDefinition
  ) {
    await showWidget(
      buildWidgetLayout(
        definition
      )
    );

    setGalleryOpen(false);
  }

  const loading =
    loadingPermissions ||
    loadingLayout;

  return (
    <div className="dashboard-custom">
      <div className="dashboard-custom__header">
        <div className="welcome">
          <span className="eyebrow">
            {formatDayLabel(
              selectedDate
            )}
          </span>

          <h1>
            Bonjour{" "}
            {user.firstName}
          </h1>

          <p>
            Voici l'essentiel
            pour votre journée.
          </p>
        </div>

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
                  size={16}
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
                  size={16}
                />
                Ajouter un widget
              </button>

              <button
                type="button"
                className="dashboard-action dashboard-action--primary"
                onClick={() =>
                  setEditMode(
                    false
                  )
                }
              >
                Terminé
              </button>
            </>
          ) : canManageDashboard ? (
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
                size={16}
              />
              Personnaliser
            </button>
          ) : null}
        </div>
      </div>

      {(layoutError ||
        hotelError ||
        tasksError) && (
        <div className="dashboard-custom__feedback">
          {layoutError ||
            hotelError ||
            tasksError}
        </div>
      )}

      {saving && (
        <div className="dashboard-custom__saving">
          Enregistrement…
        </div>
      )}

      {loading ? (
        <div className="dashboard-custom__loading">
          Chargement du tableau
          de bord…
        </div>
      ) : (
        <DashboardGrid
          layout={
            visibleLayout
          }
          data={widgetData}
          viewport={
            viewport
          }
          editMode={
            editMode
          }
          onLocalChange={
            handleLocalGridChange
          }
          onCommit={
            handleGridCommit
          }
          onRemove={
            hideWidget
          }
        />
      )}

      <WidgetGallery
        open={
          galleryOpen
        }
        widgets={
          allowedDefinitions
        }
        activeKeys={
          activeKeys
        }
        onAdd={
          handleAdd
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
