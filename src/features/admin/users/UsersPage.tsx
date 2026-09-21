import {
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  useHotelPermission,
} from "../../permissions/hooks/useHotelPermission";

import {
  SettingsShell,
} from "../../../pages/SettingsShell";

import {
  useServices,
} from "../services/hooks/useServices";

import {
  EditUserModal,
} from "./components/EditUserModal";

import {
  InviteUserModal,
} from "./components/InviteUserModal";

import {
  UsersTable,
} from "./components/UsersTable";

import {
  useInvitations,
} from "./hooks/useInvitations";

import {
  useUsers,
} from "./hooks/useUsers";

import type {
  StaffMember,
} from "./types/users.types";


export default function UsersPage() {
  const {
    hotelId,
    session,
    user,
  } =
    useApp();


  const {
    allowed:
      canViewTeam,

    loading:
      loadingViewPermission,
  } =
    useHotelPermission(
      hotelId,
      "team.view"
    );


  const {
    allowed:
      canInvite,

    loading:
      loadingInvitePermission,
  } =
    useHotelPermission(
      hotelId,
      "team.invite"
    );


  const {
    allowed:
      canChangeRole,

    loading:
      loadingRolePermission,
  } =
    useHotelPermission(
      hotelId,
      "team.change_role"
    );


  const {
    allowed:
      canManageDepartments,

    loading:
      loadingDepartmentPermission,
  } =
    useHotelPermission(
      hotelId,
      "team.manage_departments"
    );


  const {
    allowed:
      canRemove,

    loading:
      loadingRemovePermission,
  } =
    useHotelPermission(
      hotelId,
      "team.remove"
    );


  const [
    inviteOpen,
    setInviteOpen,
  ] =
    useState(
      false
    );


  const [
    selectedUser,
    setSelectedUser,
  ] =
    useState<
      StaffMember | null
    >(
      null
    );


  const {
    users,
    loading:
      usersLoading,

    error:
      usersError,

    success:
      usersSuccess,

    refresh:
      refreshUsers,

    changeRole,
    changeDepartment,
    removeUser,
  } =
    useUsers(
      hotelId
    );


  const {
    invitations,

    loading:
      invitationsLoading,

    error:
      invitationsError,

    success:
      invitationsSuccess,

    refresh:
      refreshInvitations,

    sendInvitation,
    removeInvitation,
  } =
    useInvitations(
      hotelId,
      canInvite
    );


  const {
    services:
      departments,

    loading:
      departmentsLoading,

    error:
      departmentsError,

    refresh:
      refreshDepartments,
  } =
    useServices(
      hotelId
    );


  const loadingPermissions =
    loadingViewPermission ||
    loadingInvitePermission ||
    loadingRolePermission ||
    loadingDepartmentPermission ||
    loadingRemovePermission;


  const loading =
    usersLoading ||
    invitationsLoading ||
    departmentsLoading;


  const error =
    usersError ??
    invitationsError ??
    departmentsError;


  const success =
    usersSuccess ??
    invitationsSuccess;


  const canEditAnyUser =
    canChangeRole ||
    canManageDepartments ||
    canRemove;


  const canManagePrivilegedRoles =
    user.role ===
      "owner" ||
    user.role ===
      "admin";


  async function handleRefresh() {
    const promises: Promise<unknown>[] =
      [
        refreshUsers(),
        refreshDepartments(),
      ];


    if (
      canInvite
    ) {
      promises.push(
        refreshInvitations()
      );
    }


    await Promise.all(
      promises
    );
  }


  return (
    <SettingsShell
      sectionLabel="Administration"

      sectionTitle="Utilisateurs"

      sectionSubtitle="Équipe, rôles et services."
    >
      {loadingPermissions ? (
        <div className="users-loading">
          Vérification des permissions…
        </div>
      ) : !canViewTeam ? (
        <div className="users-loading">
          Vous n’avez pas accès à la gestion de l’équipe.
        </div>
      ) : (
        <>
          <div className="users-toolbar">
            <div className="users-toolbar-summary">
              {users.length} utilisateur
              {users.length >
              1
                ? "s"
                : ""}


              {canInvite &&
                invitations.length >
                  0 && (
                  <>
                    {" · "}

                    {
                      invitations.length
                    }{" "}

                    invitation
                    {invitations.length >
                    1
                      ? "s"
                      : ""}{" "}
                    en attente
                  </>
                )}
            </div>


            <div className="users-toolbar-actions">
              <button
                type="button"

                className="users-refresh-button"

                onClick={() =>
                  void handleRefresh()
                }

                disabled={
                  loading
                }

                title="Actualiser"
              >
                <RefreshCw
                  size={16}
                />
              </button>


              {canInvite && (
                <button
                  type="button"

                  className="users-primary-button"

                  onClick={() =>
                    setInviteOpen(
                      true
                    )
                  }
                >
                  <Plus
                    size={16}
                  />

                  Inviter
                </button>
              )}
            </div>
          </div>


          {error && (
            <div
              className="users-feedback users-feedback--error"

              role="alert"
            >
              {error}
            </div>
          )}


          {success && (
            <div
              className="users-feedback users-feedback--success"

              role="status"
            >
              {success}
            </div>
          )}


          <UsersTable
            users={
              users
            }

            invitations={
              canInvite
                ? invitations
                : []
            }

            loading={
              loading
            }

            currentUserId={
              session?.user.id
            }

            canEditUsers={
              canEditAnyUser
            }

            canCancelInvitations={
              canInvite
            }

            onEditUser={
              setSelectedUser
            }

            onCancelInvitation={
              removeInvitation
            }
          />


          {canInvite && (
            <InviteUserModal
              open={
                inviteOpen
              }

              canInvitePrivilegedRoles={
                canManagePrivilegedRoles
              }

              onClose={() =>
                setInviteOpen(
                  false
                )
              }

              onSubmit={async (
                email,
                role
              ) => {
                await sendInvitation(
                  email,
                  role
                );
              }}
            />
          )}


          {canEditAnyUser && (
            <EditUserModal
              open={
                selectedUser !==
                null
              }

              user={
                selectedUser
              }

              departments={
                departments
              }

              currentUserId={
                session?.user.id
              }

              canChangeRole={
                canChangeRole
              }

              canChangeDepartment={
                canManageDepartments
              }

              canRemoveUser={
                canRemove
              }

              canManagePrivilegedRoles={
                canManagePrivilegedRoles
              }

              onClose={() =>
                setSelectedUser(
                  null
                )
              }

              onChangeRole={
                changeRole
              }

              onChangeDepartment={
                changeDepartment
              }

              onRemove={
                removeUser
              }
            />
          )}
        </>
      )}
    </SettingsShell>
  );
}