import type {
  StaffInvitation,
  StaffMember,
} from "../types/users.types";

import {
  PendingInvitationRow,
} from "./PendingInvitationRow";

import {
  UserRow,
} from "./UserRow";


type UsersTableProps = {
  users:
    StaffMember[];

  invitations:
    StaffInvitation[];

  loading?:
    boolean;

  currentUserId?:
    string;

  canEditUsers:
    boolean;

  canCancelInvitations:
    boolean;

  onEditUser: (
    user:
      StaffMember
  ) => void;

  onCancelInvitation: (
    invitationId:
      string
  ) => Promise<void>;
};


export function UsersTable({
  users,
  invitations,
  loading = false,
  currentUserId,
  canEditUsers,
  canCancelInvitations,
  onEditUser,
  onCancelInvitation,
}: UsersTableProps) {
  const isEmpty =
    users.length ===
      0 &&
    invitations.length ===
      0;


  return (
    <div className="users-table-panel">
      <div className="users-table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                Utilisateur
              </th>

              <th>
                Service
              </th>

              <th>
                Rôle
              </th>

              <th>
                Statut
              </th>

              <th />
            </tr>
          </thead>


          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}

                  className="users-loading"
                >
                  Chargement…
                </td>
              </tr>
            ) : (
              <>
                {users.map(
                  (
                    user
                  ) => (
                    <UserRow
                      key={
                        user.id
                      }

                      user={
                        user
                      }

                      currentUserId={
                        currentUserId
                      }

                      canEdit={
                        canEditUsers
                      }

                      onEdit={
                        onEditUser
                      }
                    />
                  )
                )}


                {invitations.map(
                  (
                    invitation
                  ) => (
                    <PendingInvitationRow
                      key={
                        `invitation-${invitation.id}`
                      }

                      invitation={
                        invitation
                      }

                      canCancel={
                        canCancelInvitations
                      }

                      onCancel={
                        onCancelInvitation
                      }
                    />
                  )
                )}


                {isEmpty && (
                  <tr>
                    <td
                      colSpan={5}

                      className="users-empty"
                    >
                      Aucun utilisateur.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}