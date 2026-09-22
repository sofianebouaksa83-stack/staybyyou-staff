import {
  Plus,
  X,
} from "lucide-react";

import type {
  WidgetDefinition,
} from "../../features/widgets/registry/widgetRegistry.types";

type Props = {
  open: boolean;
  widgets: WidgetDefinition[];
  activeKeys: Set<string>;
  onAdd: (
    widget: WidgetDefinition
  ) => void;
  onClose: () => void;
};

const categoryLabels = {
  hotel: "HÔTEL",
  team: "ÉQUIPE",
  fnb: "F&B",
  "room-service":
    "ROOM SERVICE",
  other: "AUTRES",
} as const;

export function WidgetGallery({
  open,
  widgets,
  activeKeys,
  onAdd,
  onClose,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="widget-gallery-backdrop"
      onClick={onClose}
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
              Ajouter un widget
            </h2>
            <p>
              Choisissez les
              informations utiles
              pour votre accueil.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="widget-gallery__content">
          {Object.entries(
            categoryLabels
          ).map(
            ([
              category,
              label,
            ]) => {
              const items =
                widgets.filter(
                  (widget) =>
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
                  key={category}
                  className="widget-gallery__section"
                >
                  <h3>
                    {label}
                  </h3>

                  <div className="widget-gallery__list">
                    {items.map(
                      (widget) => {
                        const active =
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
                            </span>

                            <i>
                              {active
                                ? "Ajouté"
                                : (
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
