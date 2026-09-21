import {
  Check,
  Minus,
  RotateCcw,
  Save,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  RolePermission,
  RolePermissionsGroup,
} from "../types/permissions.types";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "../utils/permissions.utils";


type PermissionsModalProps = {
  open:
    boolean;

  group:
    RolePermissionsGroup | null;

  canManage:
    boolean;

  saving:
    boolean;

  onClose:
    () => void;

  onSave: (
    permissions:
      string[]
  ) => Promise<void>;

  onReset:
    () => Promise<void>;
};


function groupByCategory(
  permissions:
    RolePermission[]
) {
  const groups =
    new Map<
      string,
      {
        label:
          string;

        permissions:
          RolePermission[];
      }
    >();


  for (
    const permission of
    permissions
  ) {
    const current =
      groups.get(
        permission.category_key
      ) ?? {
        label:
          permission.category_label,

        permissions:
          [],
      };


    current.permissions.push(
      permission
    );


    groups.set(
      permission.category_key,
      current
    );
  }


  return Array.from(
    groups.entries()
  );
}


export function PermissionsModal({
  open,
  group,
  canManage,
  saving,
  onClose,
  onSave,
  onReset,
}: PermissionsModalProps) {
  const [
    selected,
    setSelected,
  ] =
    useState<
      string[]
    >([]);


  const [
    localError,
    setLocalError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    if (
      !group
    ) {
      setSelected(
        []
      );

      return;
    }


    setSelected(
      group.permissions
        .filter(
          (
            permission
          ) =>
            permission.allowed
        )
        .map(
          (
            permission
          ) =>
            permission.permission_key
        )
    );


    setLocalError(
      null
    );
  }, [
    group,
    open,
  ]);


  const protectedRole =
    group?.role ===
      "owner" ||
    group?.role ===
      "admin";


  const editable =
    Boolean(
      group &&
      canManage &&
      !protectedRole
    );


  const original =
    useMemo(
      () =>
        group?.permissions
          .filter(
            (
              permission
            ) =>
              permission.allowed
          )
          .map(
            (
              permission
            ) =>
              permission.permission_key
          )
          .sort() ??
        [],
      [
        group,
      ]
    );


  const changed =
    useMemo(
      () =>
        JSON.stringify(
          [
            ...selected,
          ].sort()
        ) !==
        JSON.stringify(
          original
        ),
      [
        selected,
        original,
      ]
    );


  if (
    !open ||
    !group
  ) {
    return null;
  }


  const categories =
    groupByCategory(
      group.permissions
    );


  function toggle(
    permissionKey:
      string
  ) {
    if (
      !editable ||
      saving
    ) {
      return;
    }


    setSelected(
      (
        current
      ) =>
        current.includes(
          permissionKey
        )
          ? current.filter(
              (
                key
              ) =>
                key !==
                permissionKey
            )
          : [
              ...current,
              permissionKey,
            ]
    );
  }


  async function handleSave() {
    if (
      !editable ||
      !changed ||
      saving
    ) {
      return;
    }


    try {
      setLocalError(
        null
      );


      await onSave(
        selected
      );
    } catch (
      err
    ) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Impossible d’enregistrer les permissions."
      );
    }
  }


  async function handleReset() {
    if (
      !editable ||
      saving ||
      !group
    ) {
      return;
    }

    const currentGroup =
      group;

    const confirmed =
      window.confirm(
        `Restaurer les permissions par défaut du rôle ${ROLE_LABELS[currentGroup.role]} ?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      setLocalError(
        null
      );

      await onReset();
    } catch (
      err
    ) {
      setLocalError(
        err instanceof Error
          ? err.message
          : "Impossible de restaurer les permissions."
      );
    }
  }


  return (
    <div
      className="permissions-modal-backdrop"

      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="permissions-modal">
        <button
          type="button"

          className="permissions-modal-close"

          onClick={
            onClose
          }

          disabled={
            saving
          }

          aria-label="Fermer"
        >
          <X
            size={17}
          />
        </button>


        <div className="permissions-modal-header">
          <span className="permissions-modal-eyebrow">
            Rôle
          </span>


          <h3>
            {
              ROLE_LABELS[
                group.role
              ]
            }
          </h3>


          <p>
            {
              ROLE_DESCRIPTIONS[
                group.role
              ]
            }
          </p>


          {protectedRole && (
            <p className="permissions-protected-note">
              Ce rôle est protégé et dispose d’un accès administrateur permanent.
            </p>
          )}
        </div>


        <div className="permissions-modal-content">
          {categories.map(
            ([
              categoryKey,
              category,
            ]) => (
              <section
                key={
                  categoryKey
                }

                className="permissions-category"
              >
                <h4 className="permissions-category-title">
                  {
                    category.label
                  }
                </h4>


                <div className="permissions-list">
                  {category.permissions.map(
                    (
                      permission
                    ) => {
                      const allowed =
                        editable
                          ? selected.includes(
                              permission.permission_key
                            )
                          : permission.allowed;


                      return (
                        <button
                          type="button"

                          key={
                            permission.permission_key
                          }

                          className={
                            allowed
                              ? `permissions-item permissions-item--allowed ${
                                  editable
                                    ? "permissions-item--editable"
                                    : ""
                                }`
                              : `permissions-item ${
                                  editable
                                    ? "permissions-item--editable"
                                    : ""
                                }`
                          }

                          onClick={() =>
                            toggle(
                              permission.permission_key
                            )
                          }

                          disabled={
                            !editable ||
                            saving
                          }
                        >
                          <span
                            className={
                              allowed
                                ? "permissions-item-icon permissions-item-icon--allowed"
                                : "permissions-item-icon"
                            }
                          >
                            {allowed ? (
                              <Check
                                size={14}
                              />
                            ) : (
                              <Minus
                                size={14}
                              />
                            )}
                          </span>


                          <span className="permissions-item-copy">
                            <strong>
                              {
                                permission.permission_label
                              }
                            </strong>

                            <span>
                              {
                                permission.description
                              }
                            </span>
                          </span>


                          <span
                            className={
                              allowed
                                ? "permissions-badge permissions-badge--allowed"
                                : "permissions-badge"
                            }
                          >
                            {allowed
                              ? "Autorisé"
                              : "Non autorisé"}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </section>
            )
          )}


          {localError && (
            <div className="permissions-feedback permissions-feedback--error">
              {localError}
            </div>
          )}
        </div>


        <div className="permissions-modal-footer">
          {editable ? (
            <>
              <button
                type="button"

                className="permissions-reset-button"

                onClick={() =>
                  void handleReset()
                }

                disabled={
                  saving
                }
              >
                <RotateCcw
                  size={14}
                />

                Valeurs par défaut
              </button>


              <div className="permissions-modal-footer-actions">
                <button
                  type="button"

                  className="permissions-cancel-button"

                  onClick={
                    onClose
                  }

                  disabled={
                    saving
                  }
                >
                  Fermer
                </button>


                <button
                  type="button"

                  className="permissions-save-button"

                  onClick={() =>
                    void handleSave()
                  }

                  disabled={
                    saving ||
                    !changed
                  }
                >
                  <Save
                    size={14}
                  />

                  {saving
                    ? "Enregistrement…"
                    : "Enregistrer"}
                </button>
              </div>
            </>
          ) : (
            <span>
              Les droits affichés correspondent aux permissions réellement appliquées par StayByYou.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}