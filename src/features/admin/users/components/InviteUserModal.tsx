import {
  useState,
  type FormEvent,
} from "react";

import {
  Mail,
  X,
} from "lucide-react";

import type {
  InviteRole,
} from "../types/users.types";

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;

  onSubmit: (
    email: string,
    role: InviteRole
  ) => Promise<void>;
};

const ROLE_OPTIONS: Array<{
  value: InviteRole;
  label: string;
}> = [
  {
    value: "admin",
    label: "Administrateur",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "kitchen",
    label: "Cuisine",
  },
  {
    value: "reception",
    label: "Réception",
  },
  {
    value: "delivery",
    label: "Livraison",
  },
  {
    value: "bedroom",
    label: "Hébergement",
  },
];

export function InviteUserModal({
  open,
  onClose,
  onSubmit,
}: InviteUserModalProps) {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    role,
    setRole,
  ] =
    useState<InviteRole>("reception");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    localError,
    setLocalError,
  ] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (
      !normalizedEmail ||
      !/^\S+@\S+\.\S+$/.test(
        normalizedEmail
      )
    ) {
      setLocalError(
        "Veuillez saisir une adresse e-mail valide."
      );

      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await onSubmit(
        normalizedEmail,
        role
      );

      setEmail("");
      setRole("reception");

      onClose();
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer l'invitation."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setLocalError(null);
    onClose();
  }

  return (
    <div
      className="users-modal-backdrop"
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
        onSubmit={handleSubmit}
        className="users-modal"
      >
        <button
          type="button"
          className="users-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Fermer"
        >
          <X size={17} />
        </button>

        <div className="users-modal-header">
          <h3 className="users-modal-title">
            Inviter un utilisateur
          </h3>

          <p className="users-modal-subtitle">
            La personne recevra un e-mail
            StayByYou pour créer son accès.
          </p>
        </div>

        <label className="users-field">
          <span className="users-field-label">
            Adresse e-mail
          </span>

          <input
            className="users-input"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            placeholder="prenom@hotel.com"
            autoFocus
            required
            disabled={loading}
          />
        </label>

        <label className="users-field">
          <span className="users-field-label">
            Rôle
          </span>

          <select
            className="users-select"
            value={role}
            onChange={(event) =>
              setRole(
                event.target
                  .value as InviteRole
              )
            }
            disabled={loading}
          >
            {ROLE_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </label>

        {localError && (
          <div
            className="users-feedback users-feedback--error"
            role="alert"
          >
            {localError}
          </div>
        )}

        <div className="users-modal-actions">
          <button
            type="button"
            className="users-secondary-button"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="users-primary-button"
            disabled={
              loading ||
              !email.trim()
            }
          >
            <Mail size={16} />

            {loading
              ? "Envoi…"
              : "Envoyer l'invitation"}
          </button>
        </div>
      </form>
    </div>
  );
}