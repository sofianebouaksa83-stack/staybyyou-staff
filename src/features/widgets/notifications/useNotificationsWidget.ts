import {
  useApp,
} from "../../../app/AppContext";
import {
  useNotifications,
} from "../../admin/notifications/hooks/useNotifications";

export function useNotificationsWidget() {
  const {
    hotelId,
    session,
  } = useApp();

  return useNotifications(
    hotelId,
    session?.user.id
  );
}
