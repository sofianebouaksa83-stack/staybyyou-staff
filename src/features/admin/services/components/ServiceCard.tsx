import {
  Pencil,
} from "lucide-react";

import type {
  StaffDepartment,
} from "../types/services.types";

type ServiceCardProps = {
  service: StaffDepartment;
  index: number;

  onEdit: (
    service: StaffDepartment
  ) => void;
};

export function ServiceCard({
  service,
  index,
  onEdit,
}: ServiceCardProps) {
  return (
    <article
      className={
        service.active
          ? "services-card"
          : "services-card services-card--inactive"
      }
    >
      <div className="services-card-top">
        <span className="services-card-number">
          {String(index + 1).padStart(
            2,
            "0"
          )}
        </span>

        <span
          className={
            service.active
              ? "services-status services-status--active"
              : "services-status services-status--inactive"
          }
        >
          {service.active
            ? "Actif"
            : "Inactif"}
        </span>
      </div>

      <h3 className="services-card-title">
        {service.name}
      </h3>

      <p className="services-card-description">
        Service disponible pour
        l'organisation des équipes.
      </p>

      <button
        type="button"
        className="services-edit-button"
        onClick={() =>
          onEdit(service)
        }
      >
        <Pencil size={14} />
        Modifier
      </button>
    </article>
  );
}