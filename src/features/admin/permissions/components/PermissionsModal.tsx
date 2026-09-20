import {
  Check,
  Minus,
  X,
} from "lucide-react";

import type {
  RolePermission,
  RolePermissionsGroup,
} from "../types/permissions.types";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "../utils/permissions.utils";

type PermissionsModalProps = {
  open: boolean;

  group:
    | RolePermissionsGroup
    | null;

  onClose: () => void;
};

function groupByCategory(
  permissions: RolePermission[]
) {
  const groups = new Map<
    string,
    {
      label: string;
      permissions: RolePermission[];
    }
  >();

  for (const permission of permissions) {
    const current =
      groups.get(
        permission.category_key
      ) ?? {
        label:
          permission.category_label,
        permissions: [],
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
  onClose,
}: PermissionsModalProps) {
  if (!open || !group) {
    return null;
  }

  const categories =
    groupByCategory(
      group.permissions
    );

  return (
    <div
      className="permissions-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="permissions-modal">
        <button
          type="button"
          className="permissions-modal-close"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X size={17} />
        </button>

        <div className="permissions-modal-header">
          <span className="permissions-modal-eyebrow">
            Rôle
          </span>

          <h3>
            {ROLE_LABELS[
              group.role
            ]}
          </h3>

          <p>
            {ROLE_DESCRIPTIONS[
              group.role
            ]}
          </p>
        </div>

        <div className="permissions-modal-content">
          {categories.map(
            ([
              categoryKey,
              category,
            ]) => (
              <section
                key={categoryKey}
                className="permissions-category"
              >
                <h4 className="permissions-category-title">
                  {category.label}
                </h4>

                <div className="permissions-list">
                  {category.permissions.map(
                    (
                      permission
                    ) => (
                      <div
                        key={
                          permission.permission_key
                        }
                        className={
                          permission.allowed
                            ? "permissions-item permissions-item--allowed"
                            : "permissions-item"
                        }
                      >
                        <span
                          className={
                            permission.allowed
                              ? "permissions-item-icon permissions-item-icon--allowed"
                              : "permissions-item-icon"
                          }
                        >
                          {permission.allowed ? (
                            <Check
                              size={
                                14
                              }
                            />
                          ) : (
                            <Minus
                              size={
                                14
                              }
                            />
                          )}
                        </span>

                        <div className="permissions-item-copy">
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
                        </div>

                        <span
                          className={
                            permission.allowed
                              ? "permissions-badge permissions-badge--allowed"
                              : "permissions-badge"
                          }
                        >
                          {permission.allowed
                            ? "Autorisé"
                            : "Non autorisé"}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        <div className="permissions-modal-footer">
          Les droits affichés correspondent
          aux permissions réellement
          appliquées par StayByYou.
        </div>
      </div>
    </div>
  );
}