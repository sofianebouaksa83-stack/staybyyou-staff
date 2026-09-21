import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  cancelInvitation,
  getPendingInvitations,
  inviteUser,
} from "../services/invitations.service";

import type {
  InviteRole,
  StaffInvitation,
} from "../types/users.types";


export function useInvitations(
  hotelId: string | null,
  enabled = true
) {
  const [
    invitations,
    setInvitations,
  ] =
    useState<
      StaffInvitation[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
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
          !hotelId ||
          !enabled
        ) {
          setInvitations(
            []
          );

          setLoading(
            false
          );

          setError(
            null
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
            await getPendingInvitations(
              hotelId
            );


          setInvitations(
            data
          );
        } catch (
          err
        ) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les invitations."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        hotelId,
        enabled,
      ]
    );


  useEffect(() => {
    void refresh();
  }, [
    refresh,
  ]);


  const sendInvitation =
    useCallback(
      async (
        email: string,
        role: InviteRole
      ) => {
        if (
          !hotelId
        ) {
          throw new Error(
            "Aucun établissement sélectionné."
          );
        }


        if (
          !enabled
        ) {
          throw new Error(
            "Vous n’avez pas l’autorisation d’inviter des membres."
          );
        }


        setError(
          null
        );

        setSuccess(
          null
        );


        try {
          const result =
            await inviteUser({
              hotelId,
              email,
              role,
            });


          setSuccess(
            result.message ??
              `Invitation envoyée à ${email}.`
          );


          await refresh();


          return result;
        } catch (
          err
        ) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible d'envoyer l'invitation.";


          setError(
            message
          );

          throw err;
        }
      },
      [
        hotelId,
        enabled,
        refresh,
      ]
    );


  const removeInvitation =
    useCallback(
      async (
        invitationId:
          string
      ) => {
        if (
          !enabled
        ) {
          throw new Error(
            "Vous n’avez pas l’autorisation d’annuler une invitation."
          );
        }


        setError(
          null
        );

        setSuccess(
          null
        );


        try {
          await cancelInvitation(
            invitationId
          );


          setSuccess(
            "Invitation annulée."
          );


          await refresh();
        } catch (
          err
        ) {
          const message =
            err instanceof Error
              ? err.message
              : "Impossible d'annuler l'invitation.";


          setError(
            message
          );

          throw err;
        }
      },
      [
        enabled,
        refresh,
      ]
    );


  return {
    invitations,
    loading,
    error,
    success,

    refresh,
    sendInvitation,
    removeInvitation,
  };
}