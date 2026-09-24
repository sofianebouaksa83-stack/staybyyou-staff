import type {
  DashboardWidgetSettings,
} from "../layout/dashboardLayout.types";

import type {
  CustomBoardPresetKey,
} from "./customBoard.types";

export type CustomBoardPreset = {
  key:
    CustomBoardPresetKey;

  title:
    string;

  description:
    string;

  category:
    "fnb" | "other";
};

export const customBoardPresets:
  CustomBoardPreset[] = [
    {
      key:
        "blank",

      title:
        "Bloc vide",

      description:
        "Créez un bloc entièrement personnalisé.",

      category:
        "other",
    },

    {
      key:
        "fnb_services",

      title:
        "F&B & Services",

      description:
        "Services, horaires, réservations et capacités F&B.",

      category:
        "fnb",
    },

    {
      key:
        "hotel_overview",

      title:
        "Hôtel",

      description:
        "Arrivées, départs, séjours et occupation de l'hôtel.",

      category:
        "other",
    },
  ];

export function createCustomBoardPresetSettings(
  presetKey:
    CustomBoardPresetKey
): DashboardWidgetSettings {
    if (
        presetKey ===
        "fnb_services"
        ) {
        return {
            preset:
            "fnb_services",

            title:
            "F&B & Services",

            eyebrow:
            "F&B",

            size:
            "large",

            density:
            "compact",

            showSubtitle:
            true,

            showValue:
            true,

            showCapacity:
            true,

            items: [
            {
                id:
                crypto.randomUUID(),

                label:
                "Réservations",

                subtitle:
                "Tous les services",

                type:
                "value",

                source:
                "staybyyou_fnb",

                sourceId:
                null,

                metric:
                "reservations",

                manual: {
                value:
                    null,

                capacity:
                    null,

                text:
                    null,

                status:
                    null,

                startTime:
                    null,

                endTime:
                    null,
                },
            },

            {
                id:
                crypto.randomUUID(),

                label:
                "Capacité",

                subtitle:
                "Tous les services",

                type:
                "value",

                source:
                "staybyyou_fnb",

                sourceId:
                null,

                metric:
                "capacity",

                manual: {
                value:
                    null,

                capacity:
                    null,

                text:
                    null,

                status:
                    null,

                startTime:
                    null,

                endTime:
                    null,
                },
            },

            {
                id:
                crypto.randomUUID(),

                label:
                "Remplissage",

                subtitle:
                "Tous les services",

                type:
                "text",

                source:
                "staybyyou_fnb",

                sourceId:
                null,

                metric:
                "occupancy_rate",

                manual: {
                value:
                    null,

                capacity:
                    null,

                text:
                    null,

                status:
                    null,

                startTime:
                    null,

                endTime:
                    null,
                },
            },

            {
                id:
                crypto.randomUUID(),

                label:
                "Services actifs",

                subtitle:
                "Aujourd'hui",

                type:
                "value",

                source:
                "staybyyou_fnb",

                sourceId:
                null,

                metric:
                "services_count",

                manual: {
                value:
                    null,

                capacity:
                    null,

                text:
                    null,

                status:
                    null,

                startTime:
                    null,

                endTime:
                    null,
                },
            },
            ],
        };
    }

  if (
  presetKey ===
  "hotel_overview"
) {
  return {
    preset:
      "hotel_overview",

    title:
      "Hôtel",

    eyebrow:
      "HÔTEL",

    size:
      "large",

    density:
      "compact",

    showSubtitle:
      true,

    showValue:
      true,

    showCapacity:
      true,

    items: [
      {
        id:
          crypto.randomUUID(),

        label:
          "Arrivées",

        subtitle:
          "Aujourd'hui",

        type:
          "value",

        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "arrivals",

        manual: {
          value:
            null,

          capacity:
            null,

          text:
            null,

          status:
            null,

          startTime:
            null,

          endTime:
            null,
        },
      },

      {
        id:
          crypto.randomUUID(),

        label:
          "Départs",

        subtitle:
          "Aujourd'hui",

        type:
          "value",

        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "departures",

        manual: {
          value:
            null,

          capacity:
            null,

          text:
            null,

          status:
            null,

          startTime:
            null,

          endTime:
            null,
        },
      },

      {
        id:
          crypto.randomUUID(),

        label:
          "En séjour",

        subtitle:
          "Clients actuellement présents",

        type:
          "value",

        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "in_house",

        manual: {
          value:
            null,

          capacity:
            null,

          text:
            null,

          status:
            null,

          startTime:
            null,

          endTime:
            null,
        },
      },

      {
        id:
          crypto.randomUUID(),

        label:
          "Chambres",

        subtitle:
          "Chambres actives",

        type:
          "value",

        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "room_count",

        manual: {
          value:
            null,

          capacity:
            null,

          text:
            null,

          status:
            null,

          startTime:
            null,

          endTime:
            null,
        },
      },

      {
        id:
          crypto.randomUUID(),

        label:
          "Occupation",

        subtitle:
          "Taux d'occupation",

        type:
          "text",

        source:
          "staybyyou_hotel",

        sourceId:
          null,

        metric:
          "occupancy_rate",

        manual: {
          value:
            null,

          capacity:
            null,

          text:
            null,

          status:
            null,

          startTime:
            null,

          endTime:
            null,
        },
      },
    ],
  };
}

  return {
    preset:
      "blank",

    title:
      "Nouveau bloc",

    eyebrow:
      "PERSONNALISÉ",

    size:
      "medium",

    density:
      "compact",

    showSubtitle:
      true,

    showValue:
      true,

    showCapacity:
      true,

    items:
      [],
  };
}