import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getDashboardLayout,
  resetDashboardLayout,
  saveDashboardLayout,
} from "./dashboardLayout.service";

import type {
  DashboardLayoutIdentity,
  DashboardViewport,
  DashboardWidgetLayout,
} from "./dashboardLayout.types";

type UseDashboardLayoutOptions = {
  hotelId:
    string | null;

  userId:
    string | null;

  viewport:
    DashboardViewport;

  defaultLayout:
    DashboardWidgetLayout[];
};

function cloneLayout(
  layout:
    DashboardWidgetLayout[]
) {
  return layout.map(
    (
      widget
    ) => ({
      ...widget,

      settings: {
        ...widget.settings,
      },
    })
  );
}

function isSameWidget(
  widget:
    DashboardWidgetLayout,

  widgetKey:
    string,

  instanceKey:
    string
) {
  return (
    widget.widgetKey ===
      widgetKey &&
    widget.instanceKey ===
      instanceKey
  );
}

export function useDashboardLayout({
  hotelId,
  userId,
  viewport,
  defaultLayout,
}: UseDashboardLayoutOptions) {
  const [
    layout,
    setLayout,
  ] =
    useState<
      DashboardWidgetLayout[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null
    );

  const identity =
    useMemo<
      DashboardLayoutIdentity | null
    >(
      () =>
        hotelId &&
        userId
          ? {
              hotelId,

              userId,

              viewport,
            }
          : null,

      [
        hotelId,
        userId,
        viewport,
      ]
    );

  useEffect(
    () => {
      let active =
        true;

      async function load() {
        if (
          !identity
        ) {
          if (
            active
          ) {
            setLayout(
              cloneLayout(
                defaultLayout
              )
            );

            setLoading(
              false
            );
          }

          return;
        }

        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const saved =
            await getDashboardLayout(
              identity
            );

          if (
            !active
          ) {
            return;
          }

          setLayout(
            saved.length >
              0
              ? saved
              : cloneLayout(
                  defaultLayout
                )
          );
        } catch (
          loadError
        ) {
          console.error(
            "Erreur chargement layout dashboard :",
            loadError
          );

          if (
            active
          ) {
            setLayout(
              cloneLayout(
                defaultLayout
              )
            );

            setError(
              "Impossible de charger votre disposition personnalisée."
            );
          }
        } finally {
          if (
            active
          ) {
            setLoading(
              false
            );
          }
        }
      }

      void load();

      return () => {
        active =
          false;
      };
    },

    [
      identity,
      defaultLayout,
    ]
  );

  const commitLayout =
    useCallback(
      async (
        nextLayout:
          DashboardWidgetLayout[]
      ) => {
        const previousLayout =
          cloneLayout(
            layout
          );

        const optimisticLayout =
          cloneLayout(
            nextLayout
          );

        setLayout(
          optimisticLayout
        );

        setError(
          null
        );

        if (
          !identity
        ) {
          return true;
        }

        setSaving(
          true
        );

        try {
          await saveDashboardLayout(
            identity,
            optimisticLayout
          );

          return true;
        } catch (
          saveError
        ) {
          console.error(
            "Erreur sauvegarde layout dashboard :",
            saveError
          );

          setLayout(
            previousLayout
          );

          setError(
            "La disposition n'a pas pu être enregistrée. Les derniers changements ont été annulés."
          );

          return false;
        } finally {
          setSaving(
            false
          );
        }
      },

      [
        identity,
        layout,
      ]
    );

  const updateLocalLayout =
    useCallback(
      (
        nextLayout:
          DashboardWidgetLayout[]
      ) => {
        setLayout(
          cloneLayout(
            nextLayout
          )
        );
      },

      []
    );

  const hideWidget =
    useCallback(
      async (
        widgetKey:
          string,

        instanceKey =
          "default"
      ) => {
        const next =
          layout.map(
            (
              widget
            ) =>
              isSameWidget(
                widget,
                widgetKey,
                instanceKey
              )
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
      },

      [
        commitLayout,
        layout,
      ]
    );

  const showWidget =
    useCallback(
      async (
        widget:
          DashboardWidgetLayout
      ) => {
        const existing =
          layout.find(
            (
              item
            ) =>
              isSameWidget(
                item,
                widget.widgetKey,
                widget.instanceKey
              )
          );

        const next =
          existing
            ? layout.map(
                (
                  item
                ) =>
                  isSameWidget(
                    item,
                    widget.widgetKey,
                    widget.instanceKey
                  )
                    ? {
                        ...item,

                        visible:
                          true,
                      }
                    : item
              )
            : [
                ...layout,

                {
                  ...widget,

                  visible:
                    true,
                },
              ];

        return commitLayout(
          next
        );
      },

      [
        commitLayout,
        layout,
      ]
    );

  const reset =
    useCallback(
      async () => {
        if (
          !identity
        ) {
          setLayout(
            cloneLayout(
              defaultLayout
            )
          );

          return true;
        }

        const previousLayout =
          cloneLayout(
            layout
          );

        setSaving(
          true
        );

        setError(
          null
        );

        try {
          await resetDashboardLayout(
            identity
          );

          setLayout(
            cloneLayout(
              defaultLayout
            )
          );

          return true;
        } catch (
          resetError
        ) {
          console.error(
            "Erreur réinitialisation dashboard :",
            resetError
          );

          setLayout(
            previousLayout
          );

          setError(
            "Impossible de réinitialiser l'accueil."
          );

          return false;
        } finally {
          setSaving(
            false
          );
        }
      },

      [
        defaultLayout,
        identity,
        layout,
      ]
    );

  return {
    layout,

    visibleLayout:
      layout.filter(
        (
          widget
        ) =>
          widget.visible
      ),

    loading,
    saving,
    error,

    updateLocalLayout,
    commitLayout,

    hideWidget,
    showWidget,

    reset,
  };
}