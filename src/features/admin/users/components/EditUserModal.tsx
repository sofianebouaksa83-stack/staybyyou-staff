import {
  useEffect,
  useMemo,
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
  open:
    boolean;

  user:
    StaffMember | null;

  departments:
    StaffDepartment[];

  currentUserId?:
    string;

  canChangeRole:
    boolean;

  canChangeDepartment:
    boolean;

  canRemoveUser:
    boolean;

  canManagePrivilegedRoles:
    boolean;

  onClose:
    () => void;

  onChangeRole: (
    userId:
      string,

    role:
      StaffRole
  ) => Promise<void>;

  onChangeDepartment: (
    userId:
      string,

    departmentId:
      string
  ) => Promise<void>;

  onRemove: (
    userId:
      string
  ) => Promise<void>;
};


const ALL_ROLE_OPTIONS: Array<{
  value:
    StaffRole;

  privileged?:
    boolean;
}> = [
  {
    value:
      "admin",

    privileged:
      true,
  },

  {
    value:
      "manager",

    privileged:
      true,
  },

  {
    value:
      "kitchen",
  },

  {
    value:
      "reception",
  },

  {
    value:
      "delivery",
  },

  {
    value:
      "bedroom",
  },

  {
    value:
      "read_only",
  },
];


export function EditUserModal({
  open,
  user,
  departments,
  currentUserId,
  canChangeRole,
  canChangeDepartment,
  canRemoveUser,
  canManagePrivilegedRoles,
  onClose,
  onChangeRole,
  onChangeDepartment,
  onRemove,
}: EditUserModalProps) {
  const [
    role,
    setRole,
  ] =
    useState<StaffRole>(
      "read_only"
    );


  const [
    departmentId,
    setDepartmentId,
  ] =
    useState("");


  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const [
    removing,
    setRemoving,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    if (
      user
    ) {
      setRole(
        user.role
      );


      setDepartmentId(
        getPrimaryDepartmentId(
          user
        )
      );


      setError(
        null
      );
    }
  }, [
    user,
  ]);


  const roleOptions =
    useMemo(
      () =>
        ALL_ROLE_OPTIONS.filter(
          (
            option
          ) =>
            canManagePrivilegedRoles ||
            !option.privileged
        ),
      [
        canManagePrivilegedRoles,
      ]
    );


  if (
    !open ||
    !user
  ) {
    return null;
  }


  const member =
    user;


  const isCurrentUser =
    member.user_id ===
    currentUserId;


  const isOwner =
    member.role ===
    "owner";


  const targetIsPrivileged =
    member.role ===
      "admin" ||
    member.role ===
      "manager";


  const canEditRole =
    canChangeRole &&
    !isCurrentUser &&
    !isOwner &&
    (
      canManagePrivilegedRoles ||
      !targetIsPrivileged
    );


  const canEditDepartment =
    canChangeDepartment &&
    !isOwner;


  const canRemove =
    canRemoveUser &&
    !isCurrentUser &&
    !isOwner &&
    (
      canManagePrivilegedRoles ||
      !targetIsPrivileged
    );


  const currentDepartmentId =
    getPrimaryDepartmentId(
      member
    );


  const hasRoleChanged =
    role !==
    member.role;


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
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (
      !hasChanges ||
      saving
    ) {
      return;
    }


    setSaving(
      true
    );

    setError(
      null
    );


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
    } catch (
      err
    ) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer les modifications."
      );
    } finally {
      setSaving(
        false
      );
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


    if (
      !confirmed
    ) {
      return;
    }


    setRemoving(
      true
    );

    setError(
      null
    );


    try {
      await onRemove(
        member.user_id
      );


      onClose();
    } catch (
      err
    ) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de retirer l'utilisateur."
      );
    } finally {
      setRemoving(
        false
      );
    }
  }


  function handleClose() {
    if (
      saving ||
      removing
    ) {
      return;
    }


    setError(
      null
    );

    onClose();
  }


  return (
    <div
      className="users-modal-backdrop"

      onMouseDown={(
        event
      ) => {
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
          <X
            size={17}
          />
        </button>


        <div className="users-modal-header">
          <h3 className="users-modal-title">
            Modifier l'utilisateur
          </h3>

          <p className="users-modal-subtitle">
            {getMemberDisplayName(
              member
            )}
          </p>

          {member.email && (
            <p className="users-modal-email">
              {
                member.email
              }
            </p>
          )}
        </div>


        <label className="users-field">
          <span className="users-field-label">
            Rôle
          </span>

          <select
            className="users-select"

            value={
              role
            }

            onChange={(
              event
            ) =>
              setRole(
                event.target
                  .value as
                  StaffRole
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
            ) : canEditRole ? (
              roleOptions.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option.value
                    }

                    value={
                      option.value
                    }
                  >
                    {getRoleLabel(
                      option.value
                    )}
                  </option>
                )
              )
            ) : (
              <option
                value={
                  member.role
                }
              >
                {getRoleLabel(
                  member.role
                )}
              </option>
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
                event.target.value
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
                Sélectionner un service
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


        {isCurrentUser &&
          canChangeRole && (
            <p className="users-modal-note">
              Vous ne pouvez pas modifier votre propre rôle.
            </p>
          )}


        {isOwner && (
          <p className="users-modal-note">
            Le propriétaire ne peut pas être supprimé ni changer de rôle.
          </p>
        )}


        {!canEditRole &&
          !canEditDepartment &&
          !canRemove && (
            <p className="users-modal-note">
              Vous pouvez consulter ce membre, mais vous n’avez aucune action autorisée sur son compte.
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
          {canRemove ? (
            <button
              type="button"

              className="users-danger-button"

              onClick={() =>
                void handleRemove()
              }

              disabled={
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
          ) : (
            <span />
          )}


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
              Fermer
            </button>


            {hasChanges && (
              <button
                type="submit"

                className="users-primary-button"

                disabled={
                  saving ||
                  removing
                }
              >
                {saving
                  ? "Enregistrement…"
                  : "Enregistrer"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}