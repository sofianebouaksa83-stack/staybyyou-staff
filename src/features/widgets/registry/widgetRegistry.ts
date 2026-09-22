import {
  ClientFollowupsWidget,
} from "../../../components/dashboard/ClientFollowupsWidget";
import {
  FnbWidget,
} from "../../../components/dashboard/FnbWidget";
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
  TasksWidget,
} from "../../../components/dashboard/TasksWidget";

import type {
  WidgetDefinition,
} from "./widgetRegistry.types";

export const widgetRegistry = {
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
  keyof typeof widgetRegistry;

export const widgetDefinitions =
  Object.values(
    widgetRegistry
  );
