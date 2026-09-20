import { Pencil } from "lucide-react";

import type {
  StaffMember,
} from "../types/users.types";

import {
  getMemberDepartments,
  getMemberDisplayName,
  getRoleLabel,
} from "../utils/users.utils";

type UserRowProps = {
  user: StaffMember;
  currentUserId?: string;

  onEdit: (
    user: StaffMember
  ) => void;
};

export function UserRow({
  user,
  currentUserId,
  onEdit,
}: UserRowProps) {
  const isCurrentUser =
    user.user_id === currentUserId;

  return (
    <tr>
      <td>
        <div className="users-user-cell">
          <strong className="users-user-name">
            {getMemberDisplayName(user)}
          </strong>

          {user.email && (
            <span className="users-user-email">
              {user.email}
            </span>
          )}

          {isCurrentUser && (
            <span className="users-user-you">
              Vous
            </span>
          )}
        </div>
      </td>

      <td>
        {getMemberDepartments(user)}
      </td>

      <td>
        {getRoleLabel(user.role)}
      </td>

      <td>
        <span
          className={
            user.active
              ? "users-status users-status--active"
              : "users-status users-status--inactive"
          }
        >
          {user.active
            ? "Actif"
            : "Inactif"}
        </span>
      </td>

      <td>
        <button
          type="button"
          className="users-row-action"
          onClick={() =>
            onEdit(user)
          }
        >
          <Pencil size={14} />
          Modifier
        </button>
      </td>
    </tr>
  );
}