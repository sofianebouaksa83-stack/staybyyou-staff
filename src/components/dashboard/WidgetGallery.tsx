import {
  Plus,
  X,
} from "lucide-react";

import type {
  WidgetDefinition,
} from "../../features/widgets/registry/widgetRegistry.types";

import type {
  CustomBoardPreset,
} from "../../features/widgets/custom-board/customBoard.presets";

type Props = {
  open: boolean;

  widgets:
    WidgetDefinition[];

  activeKeys:
    Set<string>;

  customBoardPresets:
    CustomBoardPreset[];

  onAddCustomBoardPreset: (
    preset:
      CustomBoardPreset
  ) => void;

  /**
   * Les widgets présents ici peuvent
   * être ajoutés plusieurs fois.
   */
  repeatableKeys:
    Set<string>;

  onAdd: (
    widget:
      WidgetDefinition
  ) => void;

  onClose:
    () => void;
};

const categoryLabels = {
  hotel:
    "HÔTEL",

  team:
    "ÉQUIPE",

  fnb:
    "F&B",

  "room-service":
    "ROOM SERVICE",

  other:
    "AUTRES",
} as const;

export function WidgetGallery({
  open,
  widgets,
  activeKeys,
  repeatableKeys,
  customBoardPresets,
  onAdd,
  onAddCustomBoardPreset,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="widget-gallery-backdrop"
      onClick={
        onClose
      }
    >
      <aside
        className="widget-gallery"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="widget-gallery__header">
          <div>
            <span>
              PERSONNALISATION
            </span>

            <h2>
              Ajouter un bloc
            </h2>

            <p>
              Choisissez les
              informations utiles
              pour votre accueil.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Fermer"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <div className="widget-gallery__content">
          {customBoardPresets.length >
            0 && (
            <section className="widget-gallery__section">
              <h3>
                BLOCS DYNAMIQUES
              </h3>

              <div className="widget-gallery__list">
                {customBoardPresets.map(
                  (
                    preset
                  ) => (
                    <button
                      type="button"
                      key={
                        preset.key
                      }
                      className="widget-gallery__item"
                      onClick={() =>
                        onAddCustomBoardPreset(
                          preset
                        )
                      }
                    >
                      <span>
                        <strong>
                          {
                            preset.title
                          }
                        </strong>

                        <small>
                          {
                            preset.description
                          }
                        </small>

                        <small className="widget-gallery__repeatable">
                          Plusieurs blocs possibles
                        </small>
                      </span>

                      <i>
                        <Plus
                          size={16}
                        />
                      </i>
                    </button>
                  )
                )}
              </div>
            </section>
          )}
          {Object.entries(
            categoryLabels
          ).map(
            ([
              category,
              label,
            ]) => {
              const items =
                widgets.filter(
                  (
                    widget
                  ) =>
                    widget.category ===
                    category
                );

              if (
                items.length ===
                0
              ) {
                return null;
              }

              return (
                <section
                  key={
                    category
                  }
                  className="widget-gallery__section"
                >
                  <h3>
                    {label}
                  </h3>

                  <div className="widget-gallery__list">
                    {items.map(
                      (
                        widget
                      ) => {
                        const repeatable =
                          repeatableKeys.has(
                            widget.widgetKey
                          );

                        const active =
                          !repeatable &&
                          activeKeys.has(
                            widget.widgetKey
                          );

                        return (
                          <button
                            type="button"
                            key={
                              widget.widgetKey
                            }
                            className="widget-gallery__item"
                            disabled={
                              active
                            }
                            onClick={() =>
                              onAdd(
                                widget
                              )
                            }
                          >
                            <span>
                              <strong>
                                {
                                  widget.title
                                }
                              </strong>

                              <small>
                                {
                                  widget.description
                                }
                              </small>

                              {repeatable && (
                                <small className="widget-gallery__repeatable">
                                  Plusieurs blocs possibles
                                </small>
                              )}
                            </span>

                            <i>
                              {active ? (
                                "Ajouté"
                              ) : (
                                <Plus
                                  size={
                                    16
                                  }
                                />
                              )}
                            </i>
                          </button>
                        );
                      }
                    )}
                  </div>
                </section>
              );
            }
          )}
        </div>
      </aside>
    </div>
  );
}