import type {
  DashboardWidgetSettings,
} from "../layout/dashboardLayout.types";

import type {
  CustomBoardItem,
  CustomBoardSettings,
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
  };

export function createCustomBoardItem():
  CustomBoardItem {
  return {
    id:
      crypto.randomUUID(),

    label:
      "Nouvelle ligne",

    subtitle:
      "",

    source:
      "manual",

    sourceId:
      null,

    value:
      0,

    capacity:
      null,
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

            source:
              item.source ===
                "fnb" ||
              item.source ===
                "hotel" ||
              item.source ===
                "room_service" ||
              item.source ===
                "sevenrooms" ||
              item.source ===
                "opera"
                ? item.source
                : "manual",

            sourceId:
              typeof item.sourceId ===
              "string"
                ? item.sourceId
                : null,

            value:
              typeof item.value ===
              "number"
                ? item.value
                : null,

            capacity:
              typeof item.capacity ===
              "number"
                ? item.capacity
                : null,
          },
        ];
      }
    );

  return {
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