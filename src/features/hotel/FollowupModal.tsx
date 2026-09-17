import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Save,
  X,
} from "lucide-react";

import type {
  GuestFollowup,
  GuestFollowupPriority,
  GuestFollowupStatus,
  GuestFollowupType,
} from "../../services/hotelService";

type FollowupValues = {
  type: GuestFollowupType;
  priority: GuestFollowupPriority;
  status: GuestFollowupStatus;
  content: string;
};

type Props = {
  open: boolean;
  followup?: GuestFollowup | null;
  onClose: () => void;

  onSubmit: (
    values: FollowupValues
  ) => Promise<void>;
};

export function FollowupModal({
  open,
  followup,
  onClose,
  onSubmit,
}: Props) {
  const [type, setType] =
    useState<GuestFollowupType>(
      "note"
    );

  const [
    priority,
    setPriority,
  ] =
    useState<GuestFollowupPriority>(
      "normal"
    );

  const [
    status,
    setStatus,
  ] =
    useState<GuestFollowupStatus>(
      "open"
    );

  const [
    content,
    setContent,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const isEditing =
    Boolean(followup);

  useEffect(() => {
    if (!open) return;

    if (followup) {
      setType(
        followup.followup_type
      );

      setPriority(
        followup.priority
      );

      setStatus(
        followup.status
      );

      setContent(
        followup.content
      );

      return;
    }

    setType("note");
    setPriority("normal");
    setStatus("open");
    setContent("");
  }, [
    open,
    followup,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (!content.trim()) {
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        type,
        priority,
        status,
        content:
          content.trim(),
      });

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="followup-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="followup-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="followup-modal-header">
          <div>
            <span className="eyebrow">
              {isEditing
                ? "MODIFIER LE SUIVI"
                : "NOUVEAU SUIVI"}
            </span>

            <h2>
              {isEditing
                ? "Modifier le suivi"
                : "Ajouter un suivi client"}
            </h2>

            <p>
              Note, demande,
              plainte ou information
              utile sur le séjour.
            </p>
          </div>

          <button
            type="button"
            className="followup-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <div className="followup-modal-body">
          <div className="followup-form-grid">
            <label className="followup-form-field">
              <span>Type</span>

              <select
                value={type}
                onChange={(event) =>
                  setType(
                    event.target
                      .value as GuestFollowupType
                  )
                }
              >
                <option value="note">
                  Note
                </option>

                <option value="request">
                  Demande
                </option>

                <option value="complaint">
                  Plainte
                </option>

                <option value="incident">
                  Incident
                </option>

                <option value="preference">
                  Préférence
                </option>

                <option value="vip">
                  VIP
                </option>
              </select>
            </label>

            <label className="followup-form-field">
              <span>Priorité</span>

              <select
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target
                      .value as GuestFollowupPriority
                  )
                }
              >
                <option value="normal">
                  Normal
                </option>

                <option value="high">
                  Haute
                </option>

                <option value="urgent">
                  Urgente
                </option>
              </select>
            </label>
          </div>

          {isEditing && (
            <label className="followup-form-field">
              <span>Statut</span>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as GuestFollowupStatus
                  )
                }
              >
                <option value="open">
                  Ouvert
                </option>

                <option value="in_progress">
                  En cours
                </option>

                <option value="resolved">
                  Résolu
                </option>
              </select>
            </label>
          )}

          <label className="followup-form-field">
            <span>Suivi</span>

            <textarea
              autoFocus
              rows={6}
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder="Ex. Le client signale un problème de climatisation…"
            />
          </label>
        </div>

        <footer className="followup-modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={
              saving ||
              !content.trim()
            }
            onClick={
              handleSubmit
            }
          >
            {isEditing ? (
              <Save size={15} />
            ) : (
              <Plus size={15} />
            )}

            {saving
              ? "Enregistrement…"
              : isEditing
              ? "Enregistrer"
              : "Ajouter le suivi"}
          </button>
        </footer>
      </div>
    </div>
  );
}