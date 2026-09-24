import type {
  DashboardWidgetSettings,
} from "../layout/dashboardLayout.types";

import type {
  CustomBoardItem,
  CustomBoardMetric,
  CustomBoardRowType,
  CustomBoardSettings,
  CustomBoardSource,
  StayByYouHotelMetric,
} from "./customBoard.types";

export const DEFAULT_CUSTOM_BOARD_SETTINGS:
  CustomBoardSettings = {
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

    preset:
      "blank",
  };

function readSource(
  value:
    unknown
): CustomBoardSource {
  switch (value) {
    case "staybyyou_fnb":
    case "fnb":
      return "staybyyou_fnb";

    case "staybyyou_hotel":
    case "hotel":
      return "staybyyou_hotel";

    case "staybyyou_room_service":
    case "room_service":
      return "staybyyou_room_service";

    case "sevenrooms":
      return "sevenrooms";

    case "opera":
      return "opera";

    case "manual":
    default:
      return "manual";
  }
}

function readRowType(
  value:
    unknown,

  legacyValue:
    number | null,

  legacyCapacity:
    number | null
): CustomBoardRowType {
  if (
    value === "value" ||
    value === "value_capacity" ||
    value === "text" ||
    value === "status" ||
    value === "time"
  ) {
    return value;
  }

  if (
    legacyCapacity !==
    null
  ) {
    return "value_capacity";
  }

  if (
    legacyValue !==
    null
  ) {
    return "value";
  }

  return "value_capacity";
}

function readNullableNumber(
  value:
    unknown
) {
  return typeof value ===
    "number" &&
    Number.isFinite(
      value
    )
      ? value
      : null;
}

function readNullableString(
  value:
    unknown
) {
  return typeof value ===
    "string"
      ? value
      : null;
}

function readMetric(
  value: unknown,
  source: CustomBoardSource
): CustomBoardMetric | null {
  if (
    source ===
    "staybyyou_fnb"
  ) {
    if (
      value === "capacity" ||
      value === "occupancy_rate" ||
      value === "services_count"
    ) {
      return value;
    }

    return "reservations";
  }

  if (
    source ===
    "staybyyou_hotel"
  ) {
    const validHotelMetrics:
      StayByYouHotelMetric[] = [
        "arrivals",
        "departures",
        "in_house",
        "room_count",
        "occupancy_rate",
      ];

    if (
      typeof value ===
        "string" &&
      validHotelMetrics.includes(
        value as StayByYouHotelMetric
      )
    ) {
      return value as StayByYouHotelMetric;
    }

    return "in_house";
  }

  return null;
}

export function createCustomBoardItem():
  CustomBoardItem {
  return {
    id:
      crypto.randomUUID(),

    label:
      "Nouvelle ligne",

    subtitle:
      "",

    type:
      "value_capacity",

    source:
      "manual",

    sourceId:
      null,

    metric:
      null,

    manual: {
      value:
        0,

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
  };
}

export function readCustomBoardSettings(
  settings:
    DashboardWidgetSettings
): CustomBoardSettings {
  const rawItems =
    Array.isArray(
      settings.items
    )
      ? settings.items
      : [];

  const items:
    CustomBoardItem[] =
    rawItems.flatMap(
      (
        raw
      ) => {
        if (
          !raw ||
          typeof raw !==
            "object" ||
          Array.isArray(
            raw
          )
        ) {
          return [];
        }

        const item =
          raw as Record<
            string,
            unknown
          >;

        /**
         * Ancien format.
         *
         * On continue volontairement à le lire,
         * mais il n'est plus réémis.
         */
        const legacyValue =
          readNullableNumber(
            item.value
          );

        const legacyCapacity =
          readNullableNumber(
            item.capacity
          );

        const manualRaw =
          item.manual &&
          typeof item.manual ===
            "object" &&
          !Array.isArray(
            item.manual
          )
            ? item.manual as Record<
                string,
                unknown
              >
            : null;

        const manualValue =
          manualRaw
            ? readNullableNumber(
                manualRaw.value
              )
            : legacyValue;

        const manualCapacity =
          manualRaw
            ? readNullableNumber(
                manualRaw.capacity
              )
            : legacyCapacity;

        const source =
          readSource(
            item.source
          )

        return [
          {
            id:
              typeof item.id ===
              "string"
                ? item.id
                : crypto.randomUUID(),

            label:
              typeof item.label ===
              "string"
                ? item.label
                : "Ligne",

            subtitle:
              typeof item.subtitle ===
              "string"
                ? item.subtitle
                : "",

            type:
              readRowType(
                item.type,
                manualValue,
                manualCapacity
              ),

            source,

            sourceId:
              typeof item.sourceId ===
              "string"
                ? item.sourceId
                : null,

            metric:
              readMetric(
                item.metric,
                source
              ),

            manual: {
              value:
                manualValue,

              capacity:
                manualCapacity,

              text:
                manualRaw
                  ? readNullableString(
                      manualRaw.text
                    )
                  : null,

              status:
                manualRaw
                  ? readNullableString(
                      manualRaw.status
                    )
                  : null,

              startTime:
                manualRaw
                  ? readNullableString(
                      manualRaw.startTime
                    )
                  : null,

              endTime:
                manualRaw
                  ? readNullableString(
                      manualRaw.endTime
                    )
                  : null,
            },
          },
        ];
      }
    );

    

  return {
    preset:
      settings.preset ===
        "fnb_services" ||
      settings.preset ===
        "hotel_overview" ||
      settings.preset ===
        "blank"
        ? settings.preset
        : null,

    title:
      typeof settings.title ===
      "string"
        ? settings.title
        : DEFAULT_CUSTOM_BOARD_SETTINGS.title,

    eyebrow:
      typeof settings.eyebrow ===
      "string"
        ? settings.eyebrow
        : DEFAULT_CUSTOM_BOARD_SETTINGS.eyebrow,

    size:
      settings.size ===
      "large"
        ? "large"
        : "medium",

    density:
      settings.density ===
      "comfortable"
        ? "comfortable"
        : "compact",

    showSubtitle:
      settings.showSubtitle !==
      false,

    showValue:
      settings.showValue !==
      false,

    showCapacity:
      settings.showCapacity !==
      false,

    items,
  };
}