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
  useHotelPermission,
} from "../../permissions/hooks/useHotelPermission";

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
  PermissionRole,
} from "./types/permissions.types";

import {
  groupPermissionsByRole,
} from "./utils/permissions.utils";


const ROLE_ORDER: PermissionRole[] = [
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
      canManagePermissions,

    loading:
      loadingManagePermission,
  } =
    useHotelPermission(
      hotelId,
      "team.manage_permissions"
    );


  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState<
      PermissionRole | null
    >(
      null
    );


  const {
    permissions,

    loading,
    saving,

    error,
    success,

    refresh,

    saveRole,
    resetRole,
  } =
    usePermissions(
      hotelId
    );


  const roles =
    useMemo(
      () =>
        groupPermissionsByRole(
          permissions
        ).sort(
          (
            a,
            b
          ) =>
            ROLE_ORDER.indexOf(
              a.role
            ) -
            ROLE_ORDER.indexOf(
              b.role
            )
        ),
      [
        permissions,
      ]
    );


  const selectedGroup =
    useMemo(
      () =>
        roles.find(
          (
            group
          ) =>
            group.role ===
            selectedRole
        ) ??
        null,
      [
        roles,
        selectedRole,
      ]
    );


  const loadingPermissions =
    loadingViewPermission ||
    loadingManagePermission;


  return (
    <SettingsShell
      sectionLabel="Administration"

      sectionTitle="Rôles & permissions"

      sectionSubtitle="Droits d’accès appliqués aux membres de l’établissement."
    >
      {loadingPermissions ? (
        <div className="permissions-state">
          Vérification des permissions…
        </div>
      ) : !canViewTeam ? (
        <div className="permissions-state">
          Vous n’avez pas accès aux rôles et permissions.
        </div>
      ) : (
        <>
          <div className="permissions-toolbar">
            <div className="permissions-summary">
              {roles.length} rôle
              {roles.length >
              1
                ? "s"
                : ""}

              {canManagePermissions
                ? " · Personnalisation autorisée"
                : " · Lecture seule"}
            </div>


            <button
              type="button"

              className="permissions-refresh-button"

              onClick={() =>
                void refresh()
              }

              disabled={
                loading ||
                saving
              }

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


          {success && (
            <div
              className="permissions-feedback permissions-feedback--success"

              role="status"
            >
              {success}
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
                (
                  group
                ) => (
                  <RoleCard
                    key={
                      group.role
                    }

                    group={
                      group
                    }

                    canManage={
                      canManagePermissions
                    }

                    onOpen={() =>
                      setSelectedRole(
                        group.role
                      )
                    }
                  />
                )
              )}
            </div>
          )}


          <PermissionsModal
            open={
              selectedGroup !==
              null
            }

            group={
              selectedGroup
            }

            canManage={
              canManagePermissions
            }

            saving={
              saving
            }

            onClose={() =>
              setSelectedRole(
                null
              )
            }

            onSave={async (
              allowedPermissions
            ) => {
              if (
                !selectedRole
              ) {
                return;
              }


              await saveRole(
                selectedRole,
                allowedPermissions
              );
            }}

            onReset={async () => {
              if (
                !selectedRole
              ) {
                return;
              }


              await resetRole(
                selectedRole
              );
            }}
          />
        </>
      )}
    </SettingsShell>
  );
}