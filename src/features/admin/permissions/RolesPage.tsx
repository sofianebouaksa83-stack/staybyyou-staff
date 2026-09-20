import {
  useMemo,
  useState,
} from "react";

import {
  RefreshCw,
} from "lucide-react";

import {
  useApp,
} from "../../../app/AppContext";

import {
  SettingsShell,
} from "../../../pages/SettingsShell";

import {
  PermissionsModal,
} from "./components/PermissionsModal";

import {
  RoleCard,
} from "./components/RoleCard";

import {
  usePermissions,
} from "./hooks/usePermissions";

import type {
  RolePermissionsGroup,
} from "./types/permissions.types";

import {
  groupPermissionsByRole,
} from "./utils/permissions.utils";

const ROLE_ORDER = [
  "owner",
  "admin",
  "manager",
  "kitchen",
  "reception",
  "delivery",
  "bedroom",
  "read_only",
];

export default function RolesPage() {
  const {
    hotelId,
  } = useApp();

  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState<RolePermissionsGroup | null>(
      null
    );

  const {
    permissions,
    loading,
    error,
    refresh,
  } =
    usePermissions(hotelId);

  const roles =
    useMemo(() => {
      return groupPermissionsByRole(
        permissions
      ).sort(
        (a, b) =>
          ROLE_ORDER.indexOf(
            a.role
          ) -
          ROLE_ORDER.indexOf(
            b.role
          )
      );
    }, [permissions]);

  return (
    <SettingsShell
      sectionLabel="Administration"
      sectionTitle="Rôles & permissions"
      sectionSubtitle="Droits d’accès appliqués aux membres de l’établissement."
    >
      <div className="permissions-toolbar">
        <div className="permissions-summary">
          {roles.length} rôle
          {roles.length > 1
            ? "s"
            : ""}
        </div>

        <button
          type="button"
          className="permissions-refresh-button"
          onClick={() =>
            void refresh()
          }
          disabled={loading}
          title="Actualiser"
        >
          <RefreshCw
            size={16}
          />
        </button>
      </div>

      {error && (
        <div
          className="permissions-feedback permissions-feedback--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="permissions-state">
          Chargement…
        </div>
      ) : roles.length ===
        0 ? (
        <div className="permissions-state">
          Aucun rôle disponible.
        </div>
      ) : (
        <div className="permissions-grid">
          {roles.map(
            (group) => (
              <RoleCard
                key={
                  group.role
                }
                group={
                  group
                }
                onOpen={
                  setSelectedRole
                }
              />
            )
          )}
        </div>
      )}

      <PermissionsModal
        open={
          selectedRole !==
          null
        }
        group={
          selectedRole
        }
        onClose={() =>
          setSelectedRole(
            null
          )
        }
      />
    </SettingsShell>
  );
}