import {
  Clock3,
  UtensilsCrossed,
} from "lucide-react";

import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

const statusLabels = {
  new: "Nouvelle",
  accepted: "Acceptée",
  preparing: "Préparation",
  ready: "Prête",
  delivering: "Livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
} as const;

export function RoomServiceWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  const {
    orders,
    loading,
    error,
  } = data.roomService;

  if (size === "small") {
    return (
      <div className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small">
        <div className="dashboard-widget-card__icon">
          <UtensilsCrossed
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Commandes en cours
          </span>
          <strong>
            {loading
              ? "…"
              : orders.length}
          </strong>
        </div>
      </div>
    );
  }

  const limit =
    size === "large"
      ? 6
      : 4;

  return (
    <section className={`dashboard-widget-card dashboard-widget-card--list dashboard-widget-card--${size}`}>
      <div className="dashboard-widget-card__header">
        <div>
          <span className="dashboard-widget-card__eyebrow">
            ROOM SERVICE
          </span>
          <h2>
            Commandes en cours
          </h2>
        </div>

        <UtensilsCrossed
          size={18}
        />
      </div>

      {error ? (
        <p className="dashboard-widget-card__error">
          {error}
        </p>
      ) : loading ? (
        <p className="dashboard-widget-card__empty">
          Chargement…
        </p>
      ) : orders.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucune commande en cours.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {orders
            .slice(0, limit)
            .map(
              (order) => (
                <div
                  className="dashboard-widget-feed"
                  key={
                    order.id
                  }
                >
                  <div>
                    <strong>
                      {
                        order.display_id
                      }
                    </strong>
                    <span>
                      {
                        order.room_name
                      }
                    </span>
                    {size ===
                      "large" && (
                      <p>
                        {
                          order.guest_name
                        }
                      </p>
                    )}
                  </div>

                  <small>
                    {
                      statusLabels[
                        order.status
                      ]
                    }
                  </small>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}

export function RoomServiceLateWidget({
  size,
  data,
}: DashboardWidgetComponentProps) {
  const {
    lateOrders,
    loading,
    error,
  } = data.roomService;

  if (size === "small") {
    return (
      <div className="dashboard-widget-card dashboard-widget-card--stat dashboard-widget-card--small">
        <div className="dashboard-widget-card__icon">
          <Clock3
            size={18}
          />
        </div>

        <div className="dashboard-widget-card__body">
          <span>
            Commandes en retard
          </span>
          <strong>
            {loading
              ? "…"
              : lateOrders.length}
          </strong>
        </div>
      </div>
    );
  }

  const limit =
    size === "large"
      ? 6
      : 4;

  return (
    <section className={`dashboard-widget-card dashboard-widget-card--list dashboard-widget-card--${size}`}>
      <div className="dashboard-widget-card__header">
        <div>
          <span className="dashboard-widget-card__eyebrow">
            ROOM SERVICE
          </span>
          <h2>
            Commandes en retard
          </h2>
        </div>

        <Clock3 size={18} />
      </div>

      {error ? (
        <p className="dashboard-widget-card__error">
          {error}
        </p>
      ) : loading ? (
        <p className="dashboard-widget-card__empty">
          Chargement…
        </p>
      ) : lateOrders.length ===
        0 ? (
        <p className="dashboard-widget-card__empty">
          Aucune commande en retard.
        </p>
      ) : (
        <div className="dashboard-widget-list">
          {lateOrders
            .slice(0, limit)
            .map(
              (order) => (
                <div
                  className="dashboard-widget-feed dashboard-widget-feed--late"
                  key={
                    order.id
                  }
                >
                  <div>
                    <strong>
                      {
                        order.display_id
                      }
                    </strong>
                    <span>
                      {
                        order.room_name
                      }
                    </span>
                  </div>

                  <small>
                    Retard
                  </small>
                </div>
              )
            )}
        </div>
      )}
    </section>
  );
}
