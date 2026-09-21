import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getRolePermissions,
  resetRolePermissions,
  setRolePermissions,
} from "../services/permissions.service";

import type {
  PermissionRole,
  RolePermission,
} from "../types/permissions.types";


export function usePermissions(
  hotelId: string | null
) {
  const [
    permissions,
    setPermissions,
  ] =
    useState<
      RolePermission[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    saving,
    setSaving,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(null);


  const refresh =
    useCallback(
      async () => {
        if (
          !hotelId
        ) {
          setPermissions(
            []
          );

          setLoading(
            false
          );

          return;
        }


        setLoading(
          true
        );

        setError(
          null
        );


        try {
          const data =
            await getRolePermissions(
              hotelId
            );


          setPermissions(
            data
          );
        } catch (
          err
        ) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les permissions."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        hotelId,
      ]
    );


  useEffect(() => {
    void refresh();
  }, [
    refresh,
  ]);


  const saveRole =
    useCallback(
      async (
        role:
          PermissionRole,

        allowedPermissions:
          string[]
      ) => {
        if (
          !hotelId
        ) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }


        setSaving(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        try {
          await setRolePermissions(
            hotelId,
            role,
            allowedPermissions
          );


          await refresh();


          setSuccess(
            "Permissions mises à jour."
          );
        } catch (
          err
        ) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de modifier les permissions.";


          setError(
            message
          );


          throw err;
        } finally {
          setSaving(
            false
          );
        }
      },
      [
        hotelId,
        refresh,
      ]
    );


  const resetRole =
    useCallback(
      async (
        role:
          PermissionRole
      ) => {
        if (
          !hotelId
        ) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }


        setSaving(
          true
        );

        setError(
          null
        );

        setSuccess(
          null
        );


        try {
          await resetRolePermissions(
            hotelId,
            role
          );


          await refresh();


          setSuccess(
            "Permissions par défaut restaurées."
          );
        } catch (
          err
        ) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de réinitialiser les permissions.";


          setError(
            message
          );


          throw err;
        } finally {
          setSaving(
            false
          );
        }
      },
      [
        hotelId,
        refresh,
      ]
    );


  return {
    permissions,

    loading,
    saving,

    error,
    success,

    refresh,

    saveRole,
    resetRole,
  };
}