import {
  supabase,
} from "../../../services/supabase";

export type RoomServiceOrderWidgetRow = {
  id: string;
  display_id: string;
  room_name: string;
  guest_name: string;
  status:
    | "new"
    | "accepted"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  estimated_minutes:
    | number
    | null;
  created_at: string;
  service_type: string;
};

const ACTIVE_STATUSES = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "delivering",
] as const;

export async function getActiveRoomServiceOrders(
  hotelId: string
) {
  const {
    data,
    error,
  } = await supabase
    .from("orders")
    .select(
      "id, display_id, room_name, guest_name, status, estimated_minutes, created_at, service_type"
    )
    .eq("hotel_id", hotelId)
    .in(
      "status",
      [...ACTIVE_STATUSES]
    )
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (
    data ?? []
  ) as RoomServiceOrderWidgetRow[];
}

export function isRoomServiceOrderLate(
  order:
    RoomServiceOrderWidgetRow,
  now = Date.now()
) {
  const estimate =
    order.estimated_minutes;

  if (
    !estimate ||
    estimate <= 0
  ) {
    return false;
  }

  const deadline =
    new Date(
      order.created_at
    ).getTime() +
    estimate * 60_000;

  return deadline < now;
}
