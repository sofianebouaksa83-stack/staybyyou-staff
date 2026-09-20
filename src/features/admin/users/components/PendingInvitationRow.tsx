import { useState } from "react";
import { Mail } from "lucide-react";

import type {
  StaffInvitation,
} from "../types/users.types";

import {
  getFallbackDepartment,
  getRoleLabel,
} from "../utils/users.utils";

type PendingInvitationRowProps = {
  invitation: StaffInvitation;

  onCancel: (
    invitationId: string
  ) => Promise<void>;
};

export function PendingInvitationRow({
  invitation,
  onCancel,
}: PendingInvitationRowProps) {
  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  async function handleCancel() {
    const confirmed =
      window.confirm(
        `Annuler l'invitation envoyée à ${invitation.email} ?`
      );

    if (!confirmed) {
      return;
    }

    setCancelling(true);

    try {
      await onCancel(
        invitation.id
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <tr>
      <td>
        <div className="users-user-cell">
          <strong className="users-user-name">
            {invitation.email}
          </strong>

          <span className="users-invitation-meta">
            <Mail size={12} />
            Invitation en attente
          </span>
        </div>
      </td>

      <td>
        {getFallbackDepartment(
          invitation.role
        )}
      </td>

      <td>
        {getRoleLabel(
          invitation.role
        )}
      </td>

      <td>
        <span className="users-status users-status--pending">
          En attente
        </span>
      </td>

      <td>
        <button
          type="button"
          className="users-secondary-button"
          onClick={() =>
            void handleCancel()
          }
          disabled={cancelling}
        >
          {cancelling
            ? "Annulation…"
            : "Annuler"}
        </button>
      </td>
    </tr>
  );
}