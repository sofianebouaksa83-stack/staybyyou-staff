import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Trash2,
  X,
} from "lucide-react";

import type {
  StaffDepartment,
  StaffMember,
  StaffRole,
} from "../types/users.types";

import {
  getMemberDisplayName,
  getPrimaryDepartmentId,
  getRoleLabel,
} from "../utils/users.utils";

type EditUserModalProps = {
  open: boolean;

  user:
    | StaffMember
    | null;

  departments:
    StaffDepartment[];

  currentUserId?: string;

  onClose: () => void;

  onChangeRole: (
    userId: string,
    role: StaffRole
  ) => Promise<void>;

  onChangeDepartment: (
    userId: string,
    departmentId: string
  ) => Promise<void>;

  onRemove: (
    userId: string
  ) => Promise<void>;
};

const ROLE_OPTIONS: StaffRole[] = [
  "admin",
  "manager",
  "kitchen",
  "reception",
  "delivery",
  "bedroom",
  "read_only",
];

export function EditUserModal({
  open,
  user,
  departments,
  currentUserId,
  onClose,
  onChangeRole,
  onChangeDepartment,
  onRemove,
}: EditUserModalProps) {
  const [
    role,
    setRole,
  ] =
    useState<StaffRole>("read_only");

  const [
    departmentId,
    setDepartmentId,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    removing,
    setRemoving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRole(user.role);

      setDepartmentId(
        getPrimaryDepartmentId(
          user
        )
      );

      setError(null);
    }
  }, [user]);

  if (!open || !user) {
    return null;
  }

  const member = user;

  const isCurrentUser =
    member.user_id ===
    currentUserId;

  const isOwner =
    member.role ===
    "owner";

  const canEditRole =
    !isCurrentUser &&
    !isOwner;

  const canEditDepartment =
    !isOwner;

  const canRemove =
    !isCurrentUser &&
    !isOwner;

  const currentDepartmentId =
    getPrimaryDepartmentId(
      member
    );

  const hasRoleChanged =
    role !== member.role;

  const hasDepartmentChanged =
    Boolean(
      departmentId
    ) &&
    departmentId !==
      currentDepartmentId;

  const hasChanges =
    (
      canEditRole &&
      hasRoleChanged
    ) ||
    (
      canEditDepartment &&
      hasDepartmentChanged
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !hasChanges ||
      saving
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (
        canEditRole &&
        hasRoleChanged
      ) {
        await onChangeRole(
          member.user_id,
          role
        );
      }

      if (
        canEditDepartment &&
        hasDepartmentChanged
      ) {
        await onChangeDepartment(
          member.user_id,
          departmentId
        );
      }

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer les modifications."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (
      !canRemove ||
      removing
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Retirer ${getMemberDisplayName(
          member
        )} de l'établissement ?`
      );

    if (!confirmed) {
      return;
    }

    setRemoving(true);
    setError(null);

    try {
      await onRemove(
        member.user_id
      );

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de retirer l'utilisateur."
      );
    } finally {
      setRemoving(false);
    }
  }

  function handleClose() {
    if (
      saving ||
      removing
    ) {
      return;
    }

    setError(null);

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
        onSubmit={
          handleSubmit
        }
        className="users-modal"
      >
        <button
          type="button"
          className="users-modal-close"
          onClick={
            handleClose
          }
          disabled={
            saving ||
            removing
          }
          aria-label="Fermer"
        >
          <X size={17} />
        </button>

        <div className="users-modal-header">
          <h3 className="users-modal-title">
            Modifier
            l'utilisateur
          </h3>

          <p className="users-modal-subtitle">
            {getMemberDisplayName(
              member
            )}
          </p>

          {member.email && (
            <p className="users-modal-email">
              {member.email}
            </p>
          )}
        </div>

        <label className="users-field">
          <span className="users-field-label">
            Rôle
          </span>

          <select
            className="users-select"
            value={role}
            onChange={(
              event
            ) =>
              setRole(
                event.target
                  .value as StaffRole
              )
            }
            disabled={
              !canEditRole ||
              saving ||
              removing
            }
          >
            {isOwner ? (
              <option value="owner">
                Propriétaire
              </option>
            ) : (
              ROLE_OPTIONS.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {getRoleLabel(
                      option
                    )}
                  </option>
                )
              )
            )}
          </select>
        </label>

        <label className="users-field">
          <span className="users-field-label">
            Service
          </span>

          <select
            className="users-select"
            value={
              departmentId
            }
            onChange={(
              event
            ) =>
              setDepartmentId(
                event.target
                  .value
              )
            }
            disabled={
              !canEditDepartment ||
              saving ||
              removing ||
              departments.length ===
                0
            }
          >
            {!departmentId && (
              <option
                value=""
                disabled
              >
                Sélectionner un
                service
              </option>
            )}

            {departments.map(
              (
                department
              ) => (
                <option
                  key={
                    department.id
                  }
                  value={
                    department.id
                  }
                >
                  {department.name ||
                    "Service"}
                </option>
              )
            )}
          </select>
        </label>

        {departments.length ===
          0 && (
          <p className="users-modal-note">
            Aucun service n'est
            encore configuré.
            Crée d'abord un
            service dans
            Paramètres →
            Services.
          </p>
        )}

        {isCurrentUser && (
          <p className="users-modal-note">
            Tu ne peux pas
            modifier ton propre
            rôle, mais tu peux
            modifier ton service.
          </p>
        )}

        {isOwner && (
          <p className="users-modal-note">
            Le propriétaire ne
            peut pas être modifié
            ou retiré.
          </p>
        )}

        {error && (
          <div
            className="users-feedback users-feedback--error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="users-modal-actions users-modal-actions--split">
          <button
            type="button"
            className="users-danger-button"
            onClick={() =>
              void handleRemove()
            }
            disabled={
              !canRemove ||
              saving ||
              removing
            }
          >
            <Trash2
              size={15}
            />

            {removing
              ? "Suppression…"
              : "Retirer"}
          </button>

          <div className="users-modal-actions-right">
            <button
              type="button"
              className="users-secondary-button"
              onClick={
                handleClose
              }
              disabled={
                saving ||
                removing
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              className="users-primary-button"
              disabled={
                !hasChanges ||
                saving ||
                removing
              }
            >
              {saving
                ? "Enregistrement…"
                : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}