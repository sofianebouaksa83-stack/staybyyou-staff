import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";

import { useApp } from "../../app/AppContext";
import { useHotelPermission } from "../../features/permissions/hooks/useHotelPermission";
import {
  createFnbService,
  disableFnbService,
  getFnbDaily,
  getFnbServices,
  saveFnbDaily,
  updateFnbService,
  type FnbDailyRow,
} from "../../services/fnbService";

type DisplayService = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  reservations: number;
  capacity: number;
  enabled: boolean;
  order: number;
};

type OccupancyStatus = "low" | "medium" | "high";

function getOccupancyStatus(
  reservations: number,
  capacity: number
): OccupancyStatus {
  if (capacity <= 0) return "low";

  const percentage = reservations / capacity;

  if (percentage >= 0.75) return "high";
  if (percentage >= 0.45) return "medium";

  return "low";
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "";
}

export function FnbServicesWidget() {
  const { hotelId, selectedDate } = useApp();

  const { allowed: canEdit } = useHotelPermission(
    hotelId,
    "fnb.manage"
  );
  const [services, setServices] = useState<DisplayService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const visibleServices = useMemo(
    () =>
      services
        .filter((service) => service.enabled)
        .sort((a, b) => a.order - b.order),
    [services]
  );

  const dateLabel = selectedDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadFnb() {
      if (!hotelId) {
        setServices([]);
        setError("Aucun hôtel actif n'est associé à ce compte.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const dateKey = formatDateKey(selectedDate);
        const [serviceRows, dailyRows] = await Promise.all([
          getFnbServices(hotelId),
          getFnbDaily(hotelId, dateKey),
        ]);

        if (cancelled) return;

        const dailyMap = new Map<string, FnbDailyRow>();
        dailyRows.forEach((daily) => {
          dailyMap.set(daily.service_id, daily);
        });

        setServices(
          serviceRows.map((service) => {
            const daily = dailyMap.get(service.id);

            return {
              id: service.id,
              name: service.name,
              startTime:
                cleanTime(daily?.start_time) ||
                cleanTime(service.default_start_time),
              endTime:
                cleanTime(daily?.end_time) ||
                cleanTime(service.default_end_time),
              reservations: daily?.reservations ?? 0,
              capacity:
                daily?.capacity ?? service.default_capacity ?? 0,
              enabled: service.active,
              order: service.sort_order,
            };
          })
        );
      } catch (loadError) {
        console.error("Erreur chargement F&B :", loadError);

        if (!cancelled) {
          setError("Impossible de charger les données F&B.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadFnb();

    return () => {
      cancelled = true;
    };
  }, [hotelId, selectedDate]);

  async function updateDailyService(
    id: string,
    updates: Partial<DisplayService>
  ) {
    const current = services.find((service) => service.id === id);

    if (!current || !hotelId) return;

    const next: DisplayService = { ...current, ...updates };
    setServices((previous) =>
      previous.map((service) => (service.id === id ? next : service))
    );

    try {
      await saveFnbDaily({
        hotelId,
        serviceId: next.id,
        date: formatDateKey(selectedDate),
        startTime: next.startTime || null,
        endTime: next.endTime || null,
        reservations: next.reservations,
        capacity: next.capacity,
      });
    } catch (saveError) {
      console.error("Erreur sauvegarde F&B :", saveError);
      setServices((previous) =>
        previous.map((service) => (service.id === id ? current : service))
      );
      setError("La modification n'a pas pu être enregistrée.");
    }
  }

  async function updatePermanentService(
    id: string,
    updates: Partial<DisplayService>
  ) {
    const current = services.find((service) => service.id === id);

    if (!current) return;

    const next: DisplayService = { ...current, ...updates };
    setServices((previous) =>
      previous.map((service) => (service.id === id ? next : service))
    );

    try {
      await updateFnbService(id, {
        name: next.name,
        default_start_time: next.startTime || null,
        default_end_time: next.endTime || null,
        default_capacity: next.capacity,
        sort_order: next.order,
        active: next.enabled,
      });
    } catch (updateError) {
      console.error("Erreur modification service :", updateError);
      setServices((previous) =>
        previous.map((service) => (service.id === id ? current : service))
      );
      setError("Impossible de modifier le service.");
    }
  }

  async function addService() {
    if (!hotelId) return;

    try {
      const created = await createFnbService({
        hotelId,
        name: "Nouveau service",
        startTime: "12:00",
        endTime: "14:00",
        capacity: 50,
        sortOrder: services.length + 1,
      });

      setServices((previous) => [
        ...previous,
        {
          id: created.id,
          name: created.name,
          startTime: cleanTime(created.default_start_time),
          endTime: cleanTime(created.default_end_time),
          reservations: 0,
          capacity: created.default_capacity ?? 0,
          enabled: created.active,
          order: created.sort_order,
        },
      ]);
    } catch (createError) {
      console.error("Erreur ajout service :", createError);
      setError("Impossible d'ajouter le service.");
    }
  }

  async function removeService(id: string) {
    try {
      await disableFnbService(id);
      setServices((previous) =>
        previous.filter((service) => service.id !== id)
      );
    } catch (removeError) {
      console.error("Erreur suppression service :", removeError);
      setError("Impossible de supprimer le service.");
    }
  }

  async function moveService(id: string, direction: "up" | "down") {
    const sorted = [...services].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((service) => service.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= sorted.length) return;

    const current = sorted[index];
    const target = sorted[targetIndex];
    const currentOrder = current.order;
    const targetOrder = target.order;
    const updated = sorted.map((service) => {
      if (service.id === current.id) return { ...service, order: targetOrder };
      if (service.id === target.id) return { ...service, order: currentOrder };
      return service;
    });

    setServices(updated);

    try {
      await Promise.all([
        updateFnbService(current.id, { sort_order: targetOrder }),
        updateFnbService(target.id, { sort_order: currentOrder }),
      ]);
    } catch (moveError) {
      console.error("Erreur ordre F&B :", moveError);
      setServices(sorted);
    }
  }

  if (loading) {
    return (
      <section className="fnb-widget">
        <div className="fnb-widget-header">
          <div>
            <span className="fnb-widget-eyebrow">
              {dateLabel.toUpperCase()}
            </span>
            <h2>F&B & Services</h2>
          </div>
        </div>

        <p style={{ opacity: 0.7, fontSize: 12 }}>Chargement…</p>
      </section>
    );
  }

  return (
    <>
      <section className="fnb-widget">
        <div className="fnb-widget-header">
          <div>
            <span className="fnb-widget-eyebrow">
              {dateLabel.toUpperCase()}
            </span>
            <h2>F&B & Services</h2>
          </div>

          <div className="fnb-widget-actions">
            <span className="fnb-widget-count">
              {visibleServices.length} services
            </span>

            {canEdit && (
              <button
                className="fnb-settings-button"
                onClick={() => setIsEditing(true)}
                aria-label="Configurer le widget"
              >
                <Settings size={15} />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 10, fontSize: 10, color: "#e8b5ae" }}>
            {error}
          </div>
        )}

        <div className="fnb-list">
          {visibleServices.map((service) => {
            const status = getOccupancyStatus(
              service.reservations,
              service.capacity
            );

            return (
              <div className="fnb-row" key={service.id}>
                <div className="fnb-service-name">
                  <strong>{service.name}</strong>
                  <span>
                    {service.startTime}–{service.endTime}
                  </span>
                </div>

                {service.capacity > 0 ? (
                  <div className="fnb-capacity">
                    {canEdit ? (
                      <input
                        className={`fnb-reservations-input ${status}`}
                        type="number"
                        min="0"
                        max={service.capacity}
                        value={service.reservations}
                        aria-label={`Réservations ${service.name}`}
                        onChange={(event) => {
                          const raw = Number(event.target.value);
                          const value = Math.max(
                            0,
                            Number.isFinite(raw) ? raw : 0
                          );

                          setServices((previous) =>
                            previous.map((item) =>
                              item.id === service.id
                                ? { ...item, reservations: value }
                                : item
                            )
                          );
                        }}
                        onBlur={(event) => {
                          const value = Math.max(
                            0,
                            Number(event.target.value) || 0
                          );
                          void updateDailyService(service.id, {
                            reservations: value,
                          });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.currentTarget.blur();
                          }
                        }}
                      />
                    ) : (
                      <span className={`fnb-reservations ${status}`}>
                        {service.reservations}
                      </span>
                    )}

                    <span className="fnb-capacity-max">
                      / {service.capacity}
                    </span>
                  </div>
                ) : (
                  <span className="fnb-no-capacity">Ouvert</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {canEdit && isEditing && (
        <div
          className="fnb-modal-backdrop"
          onClick={() => setIsEditing(false)}
        >
          <div className="fnb-modal" onClick={(event) => event.stopPropagation()}>
            <div className="fnb-modal-header">
              <div>
                <span className="eyebrow">CONFIGURATION</span>
                <h2>F&B & Services</h2>
                <p>Configuration permanente des services de l'hôtel.</p>
              </div>

              <button
                className="ghost-icon"
                onClick={() => setIsEditing(false)}
                aria-label="Fermer"
              >
                <X size={19} />
              </button>
            </div>

            <div className="fnb-editor-list">
              {[...services]
                .sort((a, b) => a.order - b.order)
                .map((service) => (
                  <article className="fnb-editor-card" key={service.id}>
                    <div className="fnb-editor-top">
                      <span>{service.name}</span>

                      <div className="fnb-order-buttons">
                        <button
                          onClick={() => void moveService(service.id, "up")}
                          aria-label={`Monter ${service.name}`}
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          onClick={() => void moveService(service.id, "down")}
                          aria-label={`Descendre ${service.name}`}
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          className="danger-button"
                          onClick={() => void removeService(service.id)}
                          aria-label={`Supprimer ${service.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <label className="fnb-field">
                      Nom du service
                      <input
                        value={service.name}
                        onChange={(event) =>
                          setServices((previous) =>
                            previous.map((item) =>
                              item.id === service.id
                                ? { ...item, name: event.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={() =>
                          void updatePermanentService(service.id, {
                            name: service.name,
                          })
                        }
                      />
                    </label>

                    <div className="fnb-editor-grid">
                      <label className="fnb-field">
                        Début
                        <input
                          type="time"
                          value={service.startTime}
                          onChange={(event) =>
                            setServices((previous) =>
                              previous.map((item) =>
                                item.id === service.id
                                  ? { ...item, startTime: event.target.value }
                                  : item
                              )
                            )
                          }
                          onBlur={() =>
                            void updatePermanentService(service.id, {
                              startTime: service.startTime,
                            })
                          }
                        />
                      </label>

                      <label className="fnb-field">
                        Fin
                        <input
                          type="time"
                          value={service.endTime}
                          onChange={(event) =>
                            setServices((previous) =>
                              previous.map((item) =>
                                item.id === service.id
                                  ? { ...item, endTime: event.target.value }
                                  : item
                              )
                            )
                          }
                          onBlur={() =>
                            void updatePermanentService(service.id, {
                              endTime: service.endTime,
                            })
                          }
                        />
                      </label>

                      <label className="fnb-field">
                        Capacité
                        <input
                          type="number"
                          min="0"
                          value={service.capacity}
                          onChange={(event) =>
                            setServices((previous) =>
                              previous.map((item) =>
                                item.id === service.id
                                  ? {
                                      ...item,
                                      capacity: Math.max(
                                        0,
                                        Number(event.target.value) || 0
                                      ),
                                    }
                                  : item
                              )
                            )
                          }
                          onBlur={() =>
                            void updatePermanentService(service.id, {
                              capacity: service.capacity,
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
            </div>

            <button
              className="fnb-add-service"
              onClick={() => void addService()}
            >
              <Plus size={16} />
              Ajouter un service
            </button>

            <div className="fnb-modal-footer">
              <span>Les modifications sont enregistrées dans Supabase.</span>
              <button
                className="primary-button"
                onClick={() => setIsEditing(false)}
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
