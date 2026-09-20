import {
  CircleCheck,
  CirclePause,
  Hotel,
} from "lucide-react";

import type {
  HotelSettings,
} from "../types/hotel-settings.types";

type HotelStatusCardProps = {
  settings: HotelSettings;
};

export function HotelStatusCard({
  settings,
}: HotelStatusCardProps) {
  const roomServiceActive =
    settings.roomServiceEnabled &&
    !settings.roomServiceSuspended;

  return (
    <section className="hotel-settings-card">
      <div className="hotel-settings-card-header">
        <span className="hotel-settings-card-icon">
          <Hotel size={18} />
        </span>

        <div>
          <h3>
            État de
            l'établissement
          </h3>

          <p>
            Aperçu des services
            actuellement actifs.
          </p>
        </div>
      </div>

      <div className="hotel-settings-status-list">
        <div className="hotel-settings-status-row">
          <div>
            <strong>
              Établissement
            </strong>

            <span>
              Disponibilité
              générale
            </span>
          </div>

          <span
            className={
              settings.active
                ? "hotel-settings-status hotel-settings-status--active"
                : "hotel-settings-status hotel-settings-status--inactive"
            }
          >
            {settings.active ? (
              <CircleCheck
                size={14}
              />
            ) : (
              <CirclePause
                size={14}
              />
            )}

            {settings.active
              ? "Actif"
              : "Inactif"}
          </span>
        </div>

        <div className="hotel-settings-status-row">
          <div>
            <strong>
              Room service
            </strong>

            <span>
              État opérationnel
              actuel
            </span>
          </div>

          <span
            className={
              roomServiceActive
                ? "hotel-settings-status hotel-settings-status--active"
                : "hotel-settings-status hotel-settings-status--inactive"
            }
          >
            {roomServiceActive ? (
              <CircleCheck
                size={14}
              />
            ) : (
              <CirclePause
                size={14}
              />
            )}

            {roomServiceActive
              ? "Disponible"
              : settings.roomServiceSuspended
                ? "Suspendu"
                : "Désactivé"}
          </span>
        </div>
      </div>

      <p className="hotel-settings-note">
        Les contrôles opérationnels
        du room service seront gérés
        depuis l'espace Hôtel et non
        depuis les paramètres
        généraux.
      </p>
    </section>
  );
}