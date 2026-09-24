import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createCustomBoardItem,
} from "../../features/widgets/custom-board/customBoard.helpers";

import type {
  CustomBoardItem,
  CustomBoardSettings,
  CustomBoardSource,
} from "../../features/widgets/custom-board/customBoard.types";

import type {
  FnbDashboardService,
} from "../../features/widgets/fnb/useFnbDashboardData";

type Props = {
  value:
    CustomBoardSettings;

  fnbServices:
    FnbDashboardService[];

  onChange: (
    value:
      CustomBoardSettings
  ) => void;

  onSave:
    () => void;

  onClose:
    () => void;
};

export function CustomBoardSettingsModal({
  value,
  fnbServices,
  onChange,
  onSave,
  onClose,
}: Props) {
  function update(
    patch:
      Partial<CustomBoardSettings>
  ) {
    onChange({
      ...value,
      ...patch,
    });
  }

  function updateItem(
    id: string,
    patch:
      Partial<CustomBoardItem>
  ) {
    update({
      items:
        value.items.map(
          (
            item
          ) =>
            item.id ===
            id
              ? {
                  ...item,
                  ...patch,
                }
              : item
        ),
    });
  }

  function updateManual(
    id: string,
    patch:
      Partial<
        CustomBoardItem["manual"]
      >
  ) {
    update({
      items:
        value.items.map(
          (
            item
          ) => {
            if (
              item.id !==
              id
            ) {
              return item;
            }

            const nextManual = {
              ...item.manual,
              ...patch,
            };

            return {
              ...item,

              manual:
                nextManual,

            };
          }
        ),
    });
  }

  function updateFnbMetric(
    item:
      CustomBoardItem,

    metric:
      CustomBoardItem["metric"]
  ) {
    const config = {
      reservations: {
        label:
          "Réservations",

        type:
          "value" as const,
      },

      capacity: {
        label:
          "Capacité",

        type:
          "value" as const,
      },

      occupancy_rate: {
        label:
          "Remplissage",

        type:
          "text" as const,
      },

      services_count: {
        label:
          "Services actifs",

        type:
          "value" as const,
      },
    };

    const selected =
      config[
        metric as keyof typeof config
      ];

    updateItem(
      item.id,
      {
        metric,

        label:
          selected?.label ??
          item.label,

        type:
          selected?.type ??
          item.type,
      }
    );
  }

  function changeSource(
  item: CustomBoardItem,
  source: CustomBoardSource
) {
  if (
    source ===
    "manual"
  ) {
    updateItem(
      item.id,
      {
        source:
          "manual",

        sourceId:
          null,

        metric:
          null,
      }
    );

    return;
  }

  if (
    source ===
    "staybyyou_fnb"
  ) {
    updateItem(
      item.id,
      {
        source:
          "staybyyou_fnb",

        sourceId:
          null,

        metric:
          "reservations",

        label:
          "Réservations",

        type:
          "value",
      }
    );

    return;
  }

  if (
    source ===
    "staybyyou_hotel"
  ) {
    updateItem(
      item.id,
      {
        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "in_house",

        type:
          "value",
      }
    );

    return;
  }
}

  function toggleFnbService(
    service: FnbDashboardService
  ) {
    const existing =
      value.items.find(
        (
          item
        ) =>
          item.source ===
            "staybyyou_fnb" &&
          item.sourceId ===
            service.id
      );

    if (
      existing
    ) {
      update({
        items:
          value.items.filter(
            (
              item
            ) =>
              !(
                item.source ===
                  "staybyyou_fnb" &&
                item.sourceId ===
                  service.id
              )
          ),
      });

      return;
    }

    update({
      items: [
        ...value.items,

        {
          id:
            crypto.randomUUID(),

          label:
            service.name,

          subtitle:
            "",

          type:
            "value_capacity",

          source:
            "staybyyou_fnb",

          sourceId:
            service.id,

          metric:
            "reservations",

          manual: {
            value:
              null,

            capacity:
              null,

            text:
              null,

            status:
              null,

            startTime:
              null,

            endTime:
              null,
          },
        },
      ],
    });
  }

  function selectFnbService(
    item:
      CustomBoardItem,

    serviceId:
      string
  ) {
    const service =
      fnbServices.find(
        (
          current
        ) =>
          current.id ===
          serviceId
      );

    updateItem(
      item.id,
      {
        sourceId:
          serviceId ||
          null,

        /**
         * Si l'utilisateur n'avait pas encore
         * personnalisé le nom, on reprend
         * celui du service sélectionné.
         */
        label:
          service
            ? service.name
            : item.label,

        subtitle:
          service
            ? [
                service.startTime,
                service.endTime,
              ]
                .filter(
                  Boolean
                )
                .join(
                  "–"
                )
            : item.subtitle,
      }
    );
  }

  function moveItem(
    index: number,
    direction:
      -1 | 1
  ) {
    const target =
      index +
      direction;

    if (
      target < 0 ||
      target >=
        value.items.length
    ) {
      return;
    }

    const next = [
      ...value.items,
    ];

    [
      next[index],
      next[target],
    ] = [
      next[target],
      next[index],
    ];

    update({
      items:
        next,
    });
  }

  return (
    <div
      className="custom-board-modal-backdrop"
      onClick={
        onClose
      }
    >
      <div
        className="custom-board-modal"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <header className="custom-board-modal__header">
          <div>
            <span>
              PERSONNALISATION
            </span>

            <h2>
              Configurer le bloc
            </h2>

            <p>
              Créez votre bloc
              comme vous le souhaitez.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            <X
              size={18}
            />
          </button>
        </header>

        <section className="custom-board-modal__section">
          <h3>
            Contenu
          </h3>

          <label>
            Titre

            <input
              value={
                value.title
              }
              onChange={(
                event
              ) =>
                update({
                  title:
                    event.target
                      .value,
                })
              }
            />
          </label>

          <label>
            Petit libellé

            <input
              value={
                value.eyebrow
              }
              onChange={(
                event
              ) =>
                update({
                  eyebrow:
                    event.target
                      .value,
                })
              }
              placeholder="Ex. ACTIVITÉS"
            />
          </label>
        </section>

        <section className="custom-board-modal__section">
          <h3>
            Affichage
          </h3>

          <div className="custom-board-options">
            <button
              type="button"
              className={
                value.size ===
                "medium"
                  ? "active"
                  : ""
              }
              onClick={() =>
                update({
                  size:
                    "medium",
                })
              }
            >
              Medium
            </button>

            <button
              type="button"
              className={
                value.size ===
                "large"
                  ? "active"
                  : ""
              }
              onClick={() =>
                update({
                  size:
                    "large",
                })
              }
            >
              Large
            </button>

            <button
              type="button"
              className={
                value.density ===
                "compact"
                  ? "active"
                  : ""
              }
              onClick={() =>
                update({
                  density:
                    "compact",
                })
              }
            >
              Compact
            </button>

            <button
              type="button"
              className={
                value.density ===
                "comfortable"
                  ? "active"
                  : ""
              }
              onClick={() =>
                update({
                  density:
                    "comfortable",
                })
              }
            >
              Confortable
            </button>
          </div>

          <div className="custom-board-toggles">
            <label>
              <input
                type="checkbox"
                checked={
                  value.showSubtitle
                }
                onChange={(
                  event
                ) =>
                  update({
                    showSubtitle:
                      event.target
                        .checked,
                  })
                }
              />

              Texte secondaire
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  value.showValue
                }
                onChange={(
                  event
                ) =>
                  update({
                    showValue:
                      event.target
                        .checked,
                  })
                }
              />

              Valeur
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  value.showCapacity
                }
                onChange={(
                  event
                ) =>
                  update({
                    showCapacity:
                      event.target
                        .checked,
                  })
                }
              />

              Capacité
            </label>
          </div>
        </section>

        {value.preset ===
          "fnb_services" && (
          <section className="custom-board-modal__section">
            <div className="custom-board-modal__section-title">
              <div>
                <h3>
                  Services affichés
                </h3>

                <p className="custom-board-modal__hint">
                  Choisissez les services F&B à afficher dans ce bloc.
                </p>
              </div>
            </div>

            <div className="custom-board-source-list">
              {fnbServices.map(
                (
                  service
                ) => {
                  const checked =
                    value.items.some(
                      (
                        item
                      ) =>
                        item.source ===
                          "staybyyou_fnb" &&
                        item.sourceId ===
                          service.id
                    );

                  return (
                    <button
                      type="button"
                      key={
                        service.id
                      }
                      className={`custom-board-source-option ${
                        checked
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFnbService(
                          service
                        )
                      }
                    >
                      <span className="custom-board-source-option__check">
                        {checked
                          ? "✓"
                          : ""}
                      </span>

                      <span className="custom-board-source-option__content">
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
                      </span>

                      <span className="custom-board-source-option__value">
                        {
                          service.reservations
                        }

                        {service.capacity >
                          0 && (
                          <>
                            {" / "}
                            {
                              service.capacity
                            }
                          </>
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )}

        <section className="custom-board-modal__section">
          <div className="custom-board-modal__section-title">
            <h3>
              Lignes
            </h3>

            {value.preset !==
              "fnb_services" && (
              <button
                type="button"
                onClick={() =>
                  update({
                    items: [
                      ...value.items,
                      createCustomBoardItem(),
                    ],
                  })
                }
              >
                <Plus
                  size={15}
                />

                Ajouter
              </button>
            )}
          </div>

          <div className="custom-board-items">
            {value.items.map(
              (
                item,
                index
              ) => (
                <div
                  className="custom-board-item-editor"
                  key={
                    item.id
                  }
                >
                  <div className="custom-board-item-editor__actions">
                    <button
                      type="button"
                      disabled={
                        index ===
                        0
                      }
                      onClick={() =>
                        moveItem(
                          index,
                          -1
                        )
                      }
                    >
                      <ArrowUp
                        size={14}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        index ===
                        value.items
                          .length -
                          1
                      }
                      onClick={() =>
                        moveItem(
                          index,
                          1
                        )
                      }
                    >
                      <ArrowDown
                        size={14}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        update({
                          items:
                            value.items.filter(
                              (
                                current
                              ) =>
                                current.id !==
                                item.id
                            ),
                        })
                      }
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>

                  <label>
                    Source

                    <select
                      value={
                        item.source
                      }
                      onChange={(
                        event
                      ) =>
                        changeSource(
                          item,
                          event.target
                            .value as CustomBoardSource
                        )
                      }
                    >
                      <option value="manual">
                        Manuel
                      </option>

                      <option value="staybyyou_fnb">
                        StayByYou — F&B
                      </option>
                      <option value="staybyyou_hotel">
                        StayByYou — Hôtel
                      </option>
                    </select>
                  </label>

                  {item.source ===
                    "manual" && (
                    <label>
                      Type d'affichage

                      <select
                        value={
                          item.type
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            item.id,
                            {
                              type:
                                event.target
                                  .value as CustomBoardItem["type"],
                            }
                          )
                        }
                      >
                        <option value="value">
                          Valeur
                        </option>

                        <option value="value_capacity">
                          Valeur / capacité
                        </option>

                        <option value="text">
                          Texte
                        </option>

                        <option value="status">
                          Statut
                        </option>

                        <option value="time">
                          Horaire
                        </option>
                      </select>
                    </label>
                  )}

                  {item.source ===
                    "staybyyou_hotel" && (
                    <label>
                      Donnée hôtel

                      <select
                        value={
                          item.metric ??
                          "in_house"
                        }
                        onChange={(
                          event
                        ) => {
                          const metric =
                            event.target
                              .value as CustomBoardItem["metric"];

                          const config = {
                            arrivals: {
                              label:
                                "Arrivées",

                              type:
                                "value" as const,
                            },

                            departures: {
                              label:
                                "Départs",

                              type:
                                "value" as const,
                            },

                            in_house: {
                              label:
                                "En séjour",

                              type:
                                "value" as const,
                            },

                            room_count: {
                              label:
                                "Chambres",

                              type:
                                "value" as const,
                            },

                            occupancy_rate: {
                              label:
                                "Occupation",

                              type:
                                "text" as const,
                            },
                          };

                          const selected =
                            config[
                              metric as keyof typeof config
                            ];

                          updateItem(
                            item.id,
                            {
                              metric,

                              label:
                                selected?.label ??
                                item.label,

                              type:
                                selected?.type ??
                                item.type,
                            }
                          );
                        }}
                      >
                        <option value="arrivals">
                          Arrivées
                        </option>

                        <option value="departures">
                          Départs
                        </option>

                        <option value="in_house">
                          En séjour
                        </option>

                        <option value="room_count">
                          Nombre de chambres
                        </option>

                        <option value="occupancy_rate">
                          Taux d'occupation
                        </option>
                      </select>
                    </label>
                  )}

                  {item.source ===
  "staybyyou_fnb" && (
  <>
    <label>
      Donnée F&B

      <select
        value={
          item.metric ??
          "reservations"
        }
        onChange={(
          event
        ) =>
          updateFnbMetric(
            item,
            event.target
              .value as CustomBoardItem["metric"]
          )
        }
      >
        <option value="reservations">
          Réservations
        </option>

        <option value="capacity">
          Capacité
        </option>

        <option value="occupancy_rate">
          Taux de remplissage
        </option>

        <option value="services_count">
          Nombre de services
        </option>
      </select>
    </label>

    <label>
      Périmètre

      <select
        value={
          item.sourceId
            ? "service"
            : "all"
        }
        onChange={(
          event
        ) => {
          if (
            event.target
              .value ===
            "all"
          ) {
            updateItem(
              item.id,
              {
                sourceId:
                  null,
              }
            );

            return;
          }

          updateItem(
            item.id,
            {
              sourceId:
                fnbServices[0]
                  ?.id ??
                null,
            }
          );
        }}
      >
        <option value="all">
          Tous les services
        </option>

        <option value="service">
          Service spécifique
        </option>
      </select>
    </label>

    {item.sourceId && (
      <label>
        Service

        <select
          value={
            item.sourceId
          }
          onChange={(
            event
          ) =>
            updateItem(
              item.id,
              {
                sourceId:
                  event.target
                    .value ||
                  null,
              }
            )
          }
        >
          {fnbServices.map(
            (
              service
            ) => (
              <option
                key={
                  service.id
                }
                value={
                  service.id
                }
              >
                {
                  service.name
                }
              </option>
            )
          )}
        </select>
      </label>
    )}
  </>
)}

                  <label className="custom-board-field">
                    <span className="custom-board-field__label">
                      Nom
                    </span>

                    <input
                      className="custom-board-field__input"
                      value={
                        item.label
                      }
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          item.id,
                          {
                            label:
                              event.target
                                .value,
                          }
                        )
                      }
                    />
                  </label>

                  <label className="custom-board-field">
                    <span className="custom-board-field__label">
                      Texte secondaire
                    </span>

                    <input
                      className="custom-board-field__input"
                      value={
                        item.subtitle
                      }
                      placeholder="Ex. 19:00–21:30"                      
                      onChange={(
                        event
                      ) =>
                        updateItem(
                          item.id,
                          {
                            subtitle:
                              event.target
                                .value,
                          }
                        )
                      }
                    />
                  </label>

                  
                  {item.source ===
                    "manual" && (
                    <>
                      {item.type ===
                        "value" && (
                        <div className="custom-board-item-editor__numbers">
                          <label>
                            Valeur

                            <input
                              type="number"
                              min="0"
                              value={
                                item.manual
                                  .value ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateManual(
                                  item.id,
                                  {
                                    value:
                                      event.target
                                        .value ===
                                      ""
                                        ? null
                                        : Number(
                                            event.target
                                              .value
                                          ),
                                  }
                                )
                              }
                            />
                          </label>
                        </div>
                      )}

                      {item.type ===
                        "value_capacity" && (
                        <div className="custom-board-item-editor__numbers">
                          <label>
                            Valeur

                            <input
                              type="number"
                              min="0"
                              value={
                                item.manual
                                  .value ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateManual(
                                  item.id,
                                  {
                                    value:
                                      event.target
                                        .value ===
                                      ""
                                        ? null
                                        : Number(
                                            event.target
                                              .value
                                          ),
                                  }
                                )
                              }
                            />
                          </label>

                          <label>
                            Capacité

                            <input
                              type="number"
                              min="0"
                              value={
                                item.manual
                                  .capacity ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateManual(
                                  item.id,
                                  {
                                    capacity:
                                      event.target
                                        .value ===
                                      ""
                                        ? null
                                        : Number(
                                            event.target
                                              .value
                                          ),
                                  }
                                )
                              }
                            />
                          </label>
                        </div>
                      )}

                      {item.type ===
                        "text" && (
                        <label>
                          Texte

                          <input
                            type="text"
                            value={
                              item.manual
                                .text ??
                              ""
                            }
                            placeholder="Ex. Fermeture exceptionnelle"
                            onChange={(
                              event
                            ) =>
                              updateManual(
                                item.id,
                                {
                                  text:
                                    event.target
                                      .value ||
                                    null,
                                }
                              )
                            }
                          />
                        </label>
                      )}

                      {item.type ===
                        "status" && (
                        <label>
                          Statut

                          <input
                            type="text"
                            value={
                              item.manual
                                .status ??
                              ""
                            }
                            placeholder="Ex. Ouvert"
                            onChange={(
                              event
                            ) =>
                              updateManual(
                                item.id,
                                {
                                  status:
                                    event.target
                                      .value ||
                                    null,
                                }
                              )
                            }
                          />
                        </label>
                      )}

                      {item.type ===
                        "time" && (
                        <div className="custom-board-item-editor__numbers">
                          <label>
                            Début

                            <input
                              type="time"
                              value={
                                item.manual
                                  .startTime ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateManual(
                                  item.id,
                                  {
                                    startTime:
                                      event.target
                                        .value ||
                                      null,
                                  }
                                )
                              }
                            />
                          </label>

                          <label>
                            Fin

                            <input
                              type="time"
                              value={
                                item.manual
                                  .endTime ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateManual(
                                  item.id,
                                  {
                                    endTime:
                                      event.target
                                        .value ||
                                      null,
                                  }
                                )
                              }
                            />
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        <footer className="custom-board-modal__footer">
          <span>
            {
              value.items.length
            }{" "}
            ligne
            {value.items.length !==
            1
              ? "s"
              : ""}
          </span>

          <button
            type="button"
            className="dashboard-action dashboard-action--primary"
            onClick={
              onSave
            }
          >
            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}