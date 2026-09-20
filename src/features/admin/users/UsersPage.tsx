import { useState } from "react";
import {
  Plus,
  RefreshCw,
} from "lucide-react";

import { useApp } from "../../../app/AppContext";
import { SettingsShell } from "../../../pages/SettingsShell";

import { useServices } from "../services/hooks/useServices";

import { EditUserModal } from "./components/EditUserModal";
import { InviteUserModal } from "./components/InviteUserModal";
import { UsersTable } from "./components/UsersTable";

import { useInvitations } from "./hooks/useInvitations";
import { useUsers } from "./hooks/useUsers";

import type {
  StaffMember,
} from "./types/users.types";

export default function UsersPage() {
  const {
    hotelId,
    session,
  } = useApp();

  const [
    inviteOpen,
    setInviteOpen,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] =
    useState<StaffMember | null>(
      null
    );

  const {
    users,
    loading: usersLoading,
    error: usersError,
    success: usersSuccess,
    refresh: refreshUsers,
    changeRole,
    changeDepartment,
    removeUser,
  } = useUsers(hotelId);

  const {
    invitations,
    loading: invitationsLoading,
    error: invitationsError,
    success: invitationsSuccess,
    refresh: refreshInvitations,
    sendInvitation,
    removeInvitation,
  } = useInvitations(hotelId);

  const {
    services: departments,
    loading: departmentsLoading,
    error: departmentsError,
    refresh: refreshDepartments,
  } = useServices(hotelId);

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

  async function handleRefresh() {
    await Promise.all([
      refreshUsers(),
      refreshInvitations(),
      refreshDepartments(),
    ]);
  }

  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Utilisateurs"
      sectionSubtitle="Équipe, rôles et services."
    >
      <div className="users-toolbar">
        <div className="users-toolbar-summary">
          {users.length} utilisateur
          {users.length > 1
            ? "s"
            : ""}

          {invitations.length >
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
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw
              size={16}
            />
          </button>

          <button
            type="button"
            className="users-primary-button"
            onClick={() =>
              setInviteOpen(
                true
              )
            }
          >
            <Plus size={16} />
            Inviter
          </button>
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
        users={users}
        invitations={
          invitations
        }
        loading={loading}
        currentUserId={
          session?.user.id
        }
        onEditUser={
          setSelectedUser
        }
        onCancelInvitation={
          removeInvitation
        }
      />

      <InviteUserModal
        open={inviteOpen}
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
    </SettingsShell>
  );
}