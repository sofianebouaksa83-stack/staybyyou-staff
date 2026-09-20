import {
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  SettingsShell,
} from "../../../pages/SettingsShell";

import {
  ServiceCard,
} from "./components/ServiceCard";

import {
  ServiceModal,
} from "./components/ServiceModal";

import {
  useServices,
} from "./hooks/useServices";

import type {
  StaffDepartment,
} from "./types/services.types";

export default function ServicesPage() {
  const {
    hotelId,
  } = useApp();

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selectedService,
    setSelectedService,
  ] =
    useState<StaffDepartment | null>(
      null
    );

  const {
    services,
    loading,
    error,
    success,
    refresh,
    addService,
    saveService,
  } = useServices(hotelId);

  function handleNew() {
    setSelectedService(
      null
    );

    setModalOpen(true);
  }

  function handleEdit(
    service: StaffDepartment
  ) {
    setSelectedService(
      service
    );

    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setSelectedService(
      null
    );
  }

  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Services"
      sectionSubtitle="Organisation des équipes de l’établissement."
    >
      <div className="services-toolbar">
        <div className="services-summary">
          {services.length} service
          {services.length > 1
            ? "s"
            : ""}
        </div>

        <div className="services-toolbar-actions">
          <button
            type="button"
            className="services-refresh-button"
            onClick={() =>
              void refresh()
            }
            disabled={loading}
          >
            <RefreshCw
              size={16}
            />
          </button>

          <button
            type="button"
            className="services-primary-button"
            onClick={
              handleNew
            }
          >
            <Plus
              size={16}
            />

            Ajouter
          </button>
        </div>
      </div>

      {error && (
        <div className="services-feedback services-feedback--error">
          {error}
        </div>
      )}

      {success && (
        <div className="services-feedback services-feedback--success">
          {success}
        </div>
      )}

      {loading ? (
        <div className="services-state">
          Chargement…
        </div>
      ) : services.length ===
        0 ? (
        <div className="services-empty">
          <h3>
            Aucun service
          </h3>

          <p>
            Commence par créer les
            services de ton
            établissement.
          </p>

          <button
            type="button"
            className="services-primary-button"
            onClick={
              handleNew
            }
          >
            <Plus
              size={16}
            />
            Créer un service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(
            (
              service,
              index
            ) => (
              <ServiceCard
                key={
                  service.id
                }
                service={
                  service
                }
                index={
                  index
                }
                onEdit={
                  handleEdit
                }
              />
            )
          )}
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        service={
          selectedService
        }
        onClose={
          handleClose
        }
        onCreate={
          addService
        }
        onUpdate={
          saveService
        }
      />
    </SettingsShell>
  );
}