export type StaffNotification = {
  id: string;
  hotel_id: string;

  type: string;

  title: string;
  message: string;

  related_order_id:
    | string
    | null;

  audience_permission: string;

  created_at: string;

  read_at:
    | string
    | null;
};

export type NotificationRead = {
  notification_id: string;
  user_id: string;
  read_at: string;
};