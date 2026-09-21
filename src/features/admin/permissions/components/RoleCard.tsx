import {
  Eye,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import type {
  RolePermissionsGroup,
} from "../types/permissions.types";

import {
  countAllowedPermissions,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
} from "../utils/permissions.utils";


type RoleCardProps = {
  group:
    RolePermissionsGroup;

  canManage:
    boolean;

  onOpen: (
    group:
      RolePermissionsGroup
  ) => void;
};


export function RoleCard({
  group,
  canManage,
  onOpen,
}: RoleCardProps) {
  const allowedCount =
    countAllowedPermissions(
      group.permissions
    );


  const total =
    group.permissions.length;


  const protectedRole =
    group.role ===
      "owner" ||
    group.role ===
      "admin";


  const editable =
    canManage &&
    !protectedRole;


  return (
    <article className="permissions-role-card">
      <div className="permissions-role-card-header">
        <span className="permissions-role-icon">
          <ShieldCheck
            size={18}
          />
        </span>


        <span className="permissions-role-count">
          {allowedCount}/
          {total}
        </span>
      </div>


      <h3 className="permissions-role-title">
        {
          ROLE_LABELS[
            group.role
          ]
        }
      </h3>


      <p className="permissions-role-description">
        {
          ROLE_DESCRIPTIONS[
            group.role
          ]
        }
      </p>


      <div className="permissions-role-footer">
        <span>
          {protectedRole
            ? "Rôle protégé"
            : `${allowedCount} permission${allowedCount > 1 ? "s" : ""}`}
        </span>


        <button
          type="button"

          className="permissions-role-button"

          onClick={() =>
            onOpen(
              group
            )
          }
        >
          {editable ? (
            <Settings2
              size={14}
            />
          ) : (
            <Eye
              size={14}
            />
          )}


          {editable
            ? "Configurer"
            : "Voir les droits"}
        </button>
      </div>
    </article>
  );
}