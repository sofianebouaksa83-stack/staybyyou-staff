import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getHotelUsers,
  removeHotelUser,
  updateUserDepartment,
  updateUserRole,
} from "../services/users.service";

import type {
  StaffMember,
  StaffRole,
} from "../types/users.types";

export function useUsers(
  hotelId: string | null
) {
  const [
    users,
    setUsers,
  ] = useState<StaffMember[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    success,
    setSuccess,
  ] = useState<string | null>(null);

  const refresh =
    useCallback(async () => {
      if (!hotelId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data =
          await getHotelUsers(
            hotelId
          );

        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les utilisateurs."
        );
      } finally {
        setLoading(false);
      }
    }, [hotelId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const changeRole =
    useCallback(
      async (
        userId: string,
        role: StaffRole
      ) => {
        if (!hotelId) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }

        setError(null);
        setSuccess(null);

        try {
          await updateUserRole(
            hotelId,
            userId,
            role
          );

          setSuccess(
            "Rôle mis à jour."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de modifier le rôle.";

          setError(message);

          throw err;
        }
      },
      [
        hotelId,
        refresh,
      ]
    );

  const changeDepartment =
    useCallback(
      async (
        userId: string,
        departmentId: string
      ) => {
        if (!hotelId) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }

        setError(null);
        setSuccess(null);

        try {
          await updateUserDepartment(
            hotelId,
            userId,
            departmentId
          );

          setSuccess(
            "Service mis à jour."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de modifier le service.";

          setError(message);

          throw err;
        }
      },
      [
        hotelId,
        refresh,
      ]
    );

  const removeUser =
    useCallback(
      async (
        userId: string
      ) => {
        if (!hotelId) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }

        setError(null);
        setSuccess(null);

        try {
          await removeHotelUser(
            hotelId,
            userId
          );

          setSuccess(
            "Utilisateur retiré de l'établissement."
          );

          await refresh();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible de retirer l'utilisateur.";

          setError(message);

          throw err;
        }
      },
      [
        hotelId,
        refresh,
      ]
    );

  return {
    users,
    loading,
    error,
    success,
    refresh,
    changeRole,
    changeDepartment,
    removeUser,
  };
}