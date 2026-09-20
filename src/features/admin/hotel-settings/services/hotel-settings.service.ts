import { supabase } from "../../../../services/supabase";

import type {
  HotelSettings,
  UpdateHotelSettingsInput,
} from "../types/hotel-settings.types";

export async function getHotelSettings(
  hotelId: string
): Promise<HotelSettings> {
  const [
    hotelResult,
    roomServiceResult,
    brandingResult,
  ] = await Promise.all([
    supabase
      .from("hotels")
      .select(`
        id,
        name,
        active
      `)
      .eq("id", hotelId)
      .single(),

    supabase
      .from("room_service_settings")
      .select(`
        enabled,
        suspended,
        timezone
      `)
      .eq("hotel_id", hotelId)
      .maybeSingle(),

    supabase
      .from("hotel_branding")
      .select(`
        supported_languages
      `)
      .eq("hotel_id", hotelId)
      .maybeSingle(),
  ]);

  if (hotelResult.error) {
    throw new Error(
      `Impossible de charger l'établissement : ${hotelResult.error.message}`
    );
  }

  if (roomServiceResult.error) {
    throw new Error(
      `Impossible de charger les réglages : ${roomServiceResult.error.message}`
    );
  }

  if (brandingResult.error) {
    throw new Error(
      `Impossible de charger les langues : ${brandingResult.error.message}`
    );
  }

  return {
    id: hotelResult.data.id,
    name: hotelResult.data.name,
    active: hotelResult.data.active,

    timezone:
      roomServiceResult.data?.timezone ??
      "Europe/Paris",

    supportedLanguages:
      brandingResult.data
        ?.supported_languages ??
      ["fr"],

    roomServiceEnabled:
      roomServiceResult.data
        ?.enabled ?? true,

    roomServiceSuspended:
      roomServiceResult.data
        ?.suspended ?? false,
  };
}

export async function updateHotelSettings(
  hotelId: string,
  userId: string,
  input: UpdateHotelSettingsInput
): Promise<void> {
  const cleanName =
    input.name.trim();

  if (!cleanName) {
    throw new Error(
      "Le nom de l'établissement est obligatoire."
    );
  }

  const hotelResult =
    await supabase
      .from("hotels")
      .update({
        name: cleanName,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", hotelId);

  if (hotelResult.error) {
    throw new Error(
      `Impossible de modifier l'établissement : ${hotelResult.error.message}`
    );
  }

  const roomServiceResult =
    await supabase
      .from("room_service_settings")
      .upsert(
        {
          hotel_id: hotelId,
          timezone:
            input.timezone,
          updated_by:
            userId,
          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "hotel_id",
        }
      );

  if (roomServiceResult.error) {
    throw new Error(
      `Impossible d'enregistrer le fuseau horaire : ${roomServiceResult.error.message}`
    );
  }

  const brandingResult =
    await supabase
      .from("hotel_branding")
      .upsert(
        {
          hotel_id: hotelId,

          supported_languages:
            input.supportedLanguages,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "hotel_id",
        }
      );

  if (brandingResult.error) {
    throw new Error(
      `Impossible d'enregistrer les langues : ${brandingResult.error.message}`
    );
  }
}