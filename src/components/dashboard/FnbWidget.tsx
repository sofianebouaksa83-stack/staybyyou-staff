import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Settings,
  X,
} from "lucide-react";

import {
  useApp,
} from "../../app/AppContext";

import {
  useHotelPermission,
} from "../../features/permissions/hooks/useHotelPermission";

import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

function readTitle(
  value:
    unknown
) {
  return typeof value ===
    "string"
    ? value
    : "F&B & Services";
}

function readServiceIds(
  value:
    unknown
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value.filter(
    (
      item
    ): item is string =>
      typeof item ===
      "string"
  );
}

function getStatus(
  reservations:
    number,

  capacity:
    number
) {
  if (
    capacity <= 0
  ) {
    return "low";
  }

  const ratio =
    reservations /
    capacity;

  if (
    ratio >= 0.75
  ) {
    return "high";
  }

  if (
    ratio >= 0.45
  ) {
    return "medium";
  }

  return "low";
}

export function FnbWidget({
  data,
  settings,
  editMode = false,
  canConfigure = false,
  onSettingsChange,
}: DashboardWidgetComponentProps) {
  const {
    hotelId,
  } =
    useApp();

  const {
    allowed:
      canManageFnb,
  } =
    useHotelPermission(
      hotelId,
      "fnb.manage"
    );

  const [
    configOpen,
    setConfigOpen,
  ] =
    useState(
      false
    );

  const title =
    readTitle(
      settings.title
    );

  const configuredIds =
    readServiceIds(
      settings.serviceIds
    );

  const [
    draftTitle,
    setDraftTitle,
  ] =
    useState(
      title
    );

  const [
    draftIds,
    setDraftIds,
  ] =
    useState<
      string[]
    >(
      configuredIds
    );

  useEffect(
    () => {
      if (
        !configOpen
      ) {
        setDraftTitle(
          title
        );

        setDraftIds(
          configuredIds
        );
      }
    },

    [
      title,
      configOpen,
      settings.serviceIds,
    ]
  );

  const visibleServices =
    useMemo(
      () => {
        if (
          configuredIds.length ===
          0
        ) {
          return data.fnb.services;
        }

        const allowed =
          new Set(
            configuredIds
          );

        return data.fnb.services.filter(
          (
            service
          ) =>
            allowed.has(
              service.id
            )
        );
      },

      [
        configuredIds,
        data.fnb.services,
      ]
    );

  function toggleService(
    id:
      string
  ) {
    setDraftIds(
      (
        previous
      ) =>
        previous.includes(
          id
        )
          ? previous.filter(
              (
                value
              ) =>
                value !==
                id
            )
          : [
              ...previous,

              id,
            ]
    );
  }

  async function saveSettings() {
    if (
      !onSettingsChange
    ) {
      return;
    }

    const success =
      await onSettingsChange({
        ...settings,

        title:
          draftTitle.trim() ||
          "F&B & Services",

        serviceIds:
          draftIds,
      });

    if (
      success
    ) {
      setConfigOpen(
        false
      );
    }
  }

  return (
    <>
      <section className="fnb-dashboard-block">
        <div className="fnb-dashboard-block__header">
          <div>
            <span className="fnb-dashboard-block__eyebrow">
              F&B
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <div className="fnb-dashboard-block__actions">
            <span>
              {
                visibleServices.length
              }{" "}
              service
              {visibleServices.length >
              1
                ? "s"
                : ""}
            </span>

            {canConfigure &&
              onSettingsChange && (
                <button
                  type="button"
                  onClick={() =>
                    setConfigOpen(
                      true
                    )
                  }
                  aria-label={`Configurer ${title}`}
                >
                  <Settings
                    size={
                      15
                    }
                  />
                </button>
              )}
          </div>
        </div>

        {data.fnb.error && (
          <p className="fnb-dashboard-block__error">
            {
              data.fnb.error
            }
          </p>
        )}

        {data.fnb.loading ? (
          <p className="fnb-dashboard-block__empty">
            Chargement…
          </p>
        ) : visibleServices.length ===
          0 ? (
          <p className="fnb-dashboard-block__empty">
            Aucun service sélectionné.
          </p>
        ) : (
          <div className="fnb-dashboard-block__list">
            {visibleServices.map(
              (
                service
              ) => {
                const status =
                  getStatus(
                    service.reservations,
                    service.capacity
                  );

                return (
                  <div
                    className="fnb-dashboard-block__row"
                    key={
                      service.id
                    }
                  >
                    <strong>
                      {
                        service.name
                      }
                    </strong>

                    <span className="fnb-dashboard-block__time">
                      {
                        service.startTime
                      }
                      {service.startTime &&
                        service.endTime
                        ? "–"
                        : ""}
                      {
                        service.endTime
                      }
                    </span>

                    {service.capacity >
                    0 ? (
                      <div className="fnb-dashboard-block__capacity">
                        {canManageFnb ? (
                          <input
                            type="number"
                            min="0"
                            value={
                              service.reservations
                            }
                            className={`fnb-dashboard-block__reservations fnb-dashboard-block__reservations--${status}`}
                            onChange={(
                              event
                            ) => {
                              const value =
                                Math.max(
                                  0,
                                  Number(
                                    event.target.value
                                  ) ||
                                    0
                                );

                              void data.fnb.updateReservations(
                                service.id,
                                value
                              );
                            }}
                          />
                        ) : (
                          <span
                            className={`fnb-dashboard-block__reservations fnb-dashboard-block__reservations--${status}`}
                          >
                            {
                              service.reservations
                            }
                          </span>
                        )}

                        <b>
                          /{" "}
                          {
                            service.capacity
                          }
                        </b>
                      </div>
                    ) : (
                      <small>
                        Ouvert
                      </small>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {configOpen && (
        <div
          className="fnb-block-config-backdrop"
          onClick={() =>
            setConfigOpen(
              false
            )
          }
        >
          <div
            className="fnb-block-config"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="fnb-block-config__header">
              <div>
                <span>
                  PERSONNALISATION
                </span>

                <h2>
                  Configurer le bloc
                </h2>

                <p>
                  Choisissez son titre et les services à afficher.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfigOpen(
                    false
                  )
                }
                aria-label="Fermer"
              >
                <X
                  size={
                    18
                  }
                />
              </button>
            </div>

            <label className="fnb-block-config__field">
              Titre du bloc

              <input
                value={
                  draftTitle
                }
                onChange={(
                  event
                ) =>
                  setDraftTitle(
                    event.target.value
                  )
                }
                placeholder="Ex. Activités"
              />
            </label>

            <div className="fnb-block-config__services">
              <div className="fnb-block-config__services-title">
                <strong>
                  Services affichés
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setDraftIds(
                      data.fnb.services.map(
                        (
                          service
                        ) =>
                          service.id
                      )
                    )
                  }
                >
                  Tout sélectionner
                </button>
              </div>

              {data.fnb.services.map(
                (
                  service
                ) => {
                  const checked =
                    draftIds.includes(
                      service.id
                    );

                  return (
                    <button
                      type="button"
                      key={
                        service.id
                      }
                      className={`fnb-block-config__service ${
                        checked
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleService(
                          service.id
                        )
                      }
                    >
                      <span
                        className="fnb-block-config__check"
                      >
                        {checked && (
                          <Check
                            size={
                              14
                            }
                          />
                        )}
                      </span>

                      <div>
                        <strong>
                          {
                            service.name
                          }
                        </strong>

                        <small>
                          {
                            service.startTime
                          }
                          {service.startTime &&
                            service.endTime
                            ? " – "
                            : ""}
                          {
                            service.endTime
                          }
                        </small>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <div className="fnb-block-config__footer">
              <span>
                {
                  draftIds.length
                }{" "}
                sélectionné
                {draftIds.length >
                1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void saveSettings()
                }
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}