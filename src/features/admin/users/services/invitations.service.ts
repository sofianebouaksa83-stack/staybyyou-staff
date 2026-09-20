import { supabase } from "../../../../services/supabase";

import type {
  InviteUserInput,
  InviteUserResult,
  StaffInvitation,
} from "../types/users.types";

export async function getPendingInvitations(
  hotelId: string
): Promise<StaffInvitation[]> {
  const { data, error } = await supabase
    .from("staff_invitations")
    .select(`
      id,
      hotel_id,
      email,
      role,
      expires_at,
      accepted_at,
      created_at
    `)
    .eq("hotel_id", hotelId)
    .is("accepted_at", null)
    .gt(
      "expires_at",
      new Date().toISOString()
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Impossible de charger les invitations : ${error.message}`
    );
  }

  return (data ?? []) as StaffInvitation[];
}

export async function inviteUser(
  input: InviteUserInput
): Promise<InviteUserResult> {
  const email = input.email
    .trim()
    .toLowerCase();

  if (!email) {
    throw new Error(
      "L'adresse e-mail est obligatoire."
    );
  }

  const { data, error } =
    await supabase.functions.invoke(
      "send-staff-invitation",
      {
        body: {
          hotelId: input.hotelId,
          email,
          role: input.role,
        },
      }
    );

  if (error) {
    throw new Error(
      `Impossible d'envoyer l'invitation : ${error.message}`
    );
  }

  const result =
    data as InviteUserResult | null;

  if (!result?.ok) {
    throw new Error(
      result?.message ??
        "Impossible d'envoyer l'invitation."
    );
  }

  return result;
}

export async function cancelInvitation(
  invitationId: string
): Promise<void> {
  const { error } = await supabase
    .from("staff_invitations")
    .delete()
    .eq("id", invitationId);

  if (error) {
    throw new Error(
      `Impossible d'annuler l'invitation : ${error.message}`
    );
  }
}