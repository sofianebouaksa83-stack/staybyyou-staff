import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  X,
} from "lucide-react";

import type {
  StaffDepartment,
} from "../types/services.types";

type ServiceModalProps = {
  open: boolean;

  service:
    | StaffDepartment
    | null;

  onClose: () => void;

  onCreate: (
    name: string
  ) => Promise<void>;

  onUpdate: (
    id: string,
    name: string,
    active: boolean
  ) => Promise<void>;
};

export function ServiceModal({
  open,
  service,
  onClose,
  onCreate,
  onUpdate,
}: ServiceModalProps) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    active,
    setActive,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setActive(service.active);
    } else {
      setName("");
      setActive(true);
    }

    setError(null);
  }, [
    service,
    open,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanName =
      name.trim();

    if (!cleanName) {
      setError(
        "Le nom du service est obligatoire."
      );

      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (service) {
        await onUpdate(
          service.id,
          cleanName,
          active
        );
      } else {
        await onCreate(
          cleanName
        );
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) {
      return;
    }

    onClose();
  }

  return (
    <div
      className="services-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <form
        className="services-modal"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="services-modal-close"
          onClick={handleClose}
          disabled={saving}
        >
          <X size={17} />
        </button>

        <div className="services-modal-header">
          <h3>
            {service
              ? "Modifier le service"
              : "Nouveau service"}
          </h3>

          <p>
            {service
              ? "Modifie le nom ou la disponibilité du service."
              : "Ajoute un service à l'établissement."}
          </p>
        </div>

        <label className="services-field">
          <span>
            Nom du service
          </span>

          <input
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            autoFocus
            disabled={saving}
            placeholder="Ex. Réception"
          />
        </label>

        {service && (
          <label className="services-toggle-row">
            <div>
              <strong>
                Service actif
              </strong>

              <span>
                Un service inactif reste
                enregistré mais n'est plus
                disponible pour les nouvelles
                affectations.
              </span>
            </div>

            <input
              type="checkbox"
              checked={active}
              onChange={(event) =>
                setActive(
                  event.target.checked
                )
              }
              disabled={saving}
            />
          </label>
        )}

        {error && (
          <div
            className="services-feedback services-feedback--error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="services-modal-actions">
          <button
            type="button"
            className="services-secondary-button"
            onClick={handleClose}
            disabled={saving}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="services-primary-button"
            disabled={
              saving ||
              !name.trim()
            }
          >
            {saving
              ? "Enregistrement…"
              : service
                ? "Enregistrer"
                : "Créer le service"}
          </button>
        </div>
      </form>
    </div>
  );
}