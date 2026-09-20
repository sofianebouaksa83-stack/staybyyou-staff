import type {
  StaffNotification,
} from "../types/notifications.types";

export function getNotificationTypeLabel(
  type: string
) {
  switch (type) {
    case "order_new":
      return "Nouvelle commande";

    case "order_ready":
      return "Commande prête";

    case "order_cancelled":
      return "Commande annulée";

    default:
      return "Notification";
  }
}

export function formatNotificationDate(
  date: string
) {
  const createdAt =
    new Date(date);

  const diff =
    Date.now() -
    createdAt.getTime();

  const minutes =
    Math.floor(
      diff / 60000
    );

  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `Il y a ${days} j`;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(createdAt);
}

export function isNotificationUnread(
  notification: StaffNotification
) {
  return !notification.read_at;
}