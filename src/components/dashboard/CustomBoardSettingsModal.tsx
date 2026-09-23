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
  CustomBoardSettings,
} from "../../features/widgets/custom-board/customBoard.types";

type Props = {
  value:
    CustomBoardSettings;

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
      Partial<
        CustomBoardSettings["items"][number]
      >
  ) {
    update({
      items:
        value.items.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  ...patch,
                }
              : item
        ),
    });
  }

  function moveItem(
    index: number,
    direction:
      -1 | 1
  ) {
    const target =
      index + direction;

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
      items: next,
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
            <X size={18} />
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

        <section className="custom-board-modal__section">
          <div className="custom-board-modal__section-title">
            <h3>
              Lignes
            </h3>

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
                        index === 0
                      }
                      onClick={() =>
                        moveItem(
                          index,
                          -1
                        )
                      }
                    >
                      <ArrowUp
                        size={
                          14
                        }
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
                        size={
                          14
                        }
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
                        size={
                          14
                        }
                      />
                    </button>
                  </div>

                  <label>
                    Nom

                    <input
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
                              event
                                .target
                                .value,
                          }
                        )
                      }
                    />
                  </label>

                  <label>
                    Texte secondaire

                    <input
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
                              event
                                .target
                                .value,
                          }
                        )
                      }
                    />
                  </label>

                  <div className="custom-board-item-editor__numbers">
                    <label>
                      Valeur

                      <input
                        type="number"
                        value={
                          item.value ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            item.id,
                            {
                              value:
                                event
                                  .target
                                  .value ===
                                ""
                                  ? null
                                  : Number(
                                      event
                                        .target
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
                        value={
                          item.capacity ??
                          ""
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            item.id,
                            {
                              capacity:
                                event
                                  .target
                                  .value ===
                                ""
                                  ? null
                                  : Number(
                                      event
                                        .target
                                        .value
                                    ),
                            }
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <footer className="custom-board-modal__footer">
          <span>
            {value.items.length}{" "}
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