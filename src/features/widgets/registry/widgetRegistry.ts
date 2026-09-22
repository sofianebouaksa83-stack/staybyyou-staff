import {
  ClientFollowupsWidget,
} from "../../../components/dashboard/ClientFollowupsWidget";
import {
  EventsWidget,
} from "../../../components/dashboard/EventsWidget";
import {
  FnbWidget,
} from "../../../components/dashboard/FnbWidget";
import {
  FnbCapacityWidget,
  FnbReservationsWidget,
} from "../../../components/dashboard/FnbReservationsWidget";
import {
  InstructionsWidget,
} from "../../../components/dashboard/InstructionsWidget";
import {
  MessagesWidget,
} from "../../../components/dashboard/MessagesWidget";
import {
  NotificationsWidget,
} from "../../../components/dashboard/NotificationsWidget";
import {
  RoomServiceLateWidget,
  RoomServiceWidget,
} from "../../../components/dashboard/RoomServiceWidget";
import {
  HotelArrivalsWidget,
} from "../../../components/dashboard/HotelArrivalsWidget";
import {
  HotelDeparturesWidget,
} from "../../../components/dashboard/HotelDeparturesWidget";
import {
  HotelOccupancyWidget,
} from "../../../components/dashboard/HotelOccupancyWidget";
import {
  HotelOccupancyRateWidget,
} from "../../../components/dashboard/HotelOccupancyRateWidget";
import {
  TasksWidget,
} from "../../../components/dashboard/TasksWidget";

import type {
  WidgetDefinition,
} from "./widgetRegistry.types";

const widgetRegistryConfig = {
  hotel_arrivals: {
    widgetKey:
      "hotel_arrivals",
    title: "Arrivées",
    description:
      "Arrivées prévues pour la journée.",
    category: "hotel",
    permission: "hotel.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      HotelArrivalsWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  hotel_departures: {
    widgetKey:
      "hotel_departures",
    title: "Départs",
    description:
      "Départs prévus pour la journée.",
    category: "hotel",
    permission: "hotel.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      HotelDeparturesWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  hotel_in_house: {
    widgetKey:
      "hotel_in_house",
    title: "En séjour",
    description:
      "Clients actuellement présents à l'hôtel.",
    category: "hotel",
    permission: "hotel.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      HotelOccupancyWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  hotel_occupancy: {
    widgetKey:
      "hotel_occupancy",
    title: "Occupation",
    description:
      "Taux d'occupation des chambres actives.",
    category: "hotel",
    permission: "hotel.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      HotelOccupancyRateWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  client_followups: {
    widgetKey:
      "client_followups",
    title: "Suivis clients",
    description:
      "Demandes, incidents et suivis actifs.",
    category: "hotel",
    permission: "hotel.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      ClientFollowupsWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  tasks_today: {
    widgetKey:
      "tasks_today",
    title: "Tâches",
    description:
      "Tâches ouvertes pour la journée.",
    category: "team",
    permission: "tasks.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize: "medium",
    component:
      TasksWidget,
    defaultLayout: {
      desktop: {
        w: 4,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 4,
      },
    },
  },

  messages_recent: {
    widgetKey:
      "messages_recent",
    title:
      "Messages récents",
    description:
      "Derniers messages des salons accessibles.",
    category: "team",
    permission:
      "messages.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "medium",
    component:
      MessagesWidget,
    defaultLayout: {
      desktop: {
        w: 4,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 4,
      },
    },
  },

  instructions_today: {
    widgetKey:
      "instructions_today",
    title: "Consignes",
    description:
      "Consignes actives pour la journée.",
    category: "team",
    permission:
      "instructions.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "medium",
    component:
      InstructionsWidget,
    defaultLayout: {
      desktop: {
        w: 4,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 4,
      },
    },
  },

  events_today: {
    widgetKey:
      "events_today",
    title: "Événements",
    description:
      "Événements qui impactent la journée.",
    category: "team",
    permission:
      "events.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "medium",
    component:
      EventsWidget,
    defaultLayout: {
      desktop: {
        w: 4,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 4,
      },
    },
  },

  room_service_active: {
    widgetKey:
      "room_service_active",
    title:
      "Commandes en cours",
    description:
      "Commandes StayByYou encore actives.",
    category:
      "room-service",
    permission:
      "orders.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "medium",
    component:
      RoomServiceWidget,
    defaultLayout: {
      desktop: {
        w: 4,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 4,
      },
    },
  },

  room_service_late: {
    widgetKey:
      "room_service_late",
    title:
      "Commandes en retard",
    description:
      "Commandes dont le délai estimé est dépassé.",
    category:
      "room-service",
    permission:
      "orders.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "small",
    component:
      RoomServiceLateWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 3,
      },
      mobile: {
        w: 2,
        h: 3,
      },
    },
  },

  notifications: {
    widgetKey:
      "notifications",
    title:
      "Notifications",
    description:
      "Notifications récentes et éléments non lus.",
    category: "other",
    permission:
      "notifications.view",
    sizes: [
      "small",
      "medium",
      "large",
    ],
    defaultSize:
      "small",
    component:
      NotificationsWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 3,
      },
      mobile: {
        w: 2,
        h: 3,
      },
    },
  },

  fnb_reservations: {
    widgetKey:
      "fnb_reservations",
    title:
      "Réservations",
    description:
      "Total des réservations renseignées sur les services du jour.",
    category: "fnb",
    permission: "fnb.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      FnbReservationsWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  fnb_capacity: {
    widgetKey:
      "fnb_capacity",
    title: "Capacité",
    description:
      "Remplissage global des services F&B du jour.",
    category: "fnb",
    permission: "fnb.view",
    sizes: [
      "small",
      "medium",
    ],
    defaultSize: "small",
    component:
      FnbCapacityWidget,
    defaultLayout: {
      desktop: {
        w: 3,
        h: 2,
      },
      mobile: {
        w: 2,
        h: 2,
      },
    },
  },

  fnb_services: {
    widgetKey:
      "fnb_services",
    title:
      "F&B & Services",
    description:
      "Réservations, capacité et services du jour.",
    category: "fnb",
    permission: "fnb.view",
    sizes: [
      "medium",
      "large",
    ],
    defaultSize: "large",
    component: FnbWidget,
    defaultLayout: {
      desktop: {
        w: 8,
        h: 4,
      },
      mobile: {
        w: 4,
        h: 5,
      },
    },
  },
} satisfies Record<
  string,
  WidgetDefinition
>;

export type WidgetKey =
  keyof typeof widgetRegistryConfig;

export const widgetRegistry:
  Record<
    WidgetKey,
    WidgetDefinition
  > =
    widgetRegistryConfig;

export const widgetDefinitions:
  WidgetDefinition[] =
    Object.values(
      widgetRegistryConfig
    );
