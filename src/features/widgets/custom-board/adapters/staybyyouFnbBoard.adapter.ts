import type {
  FnbDashboardService,
} from "../../fnb/useFnbDashboardData";

import type {
  CustomBoardItem,
  ResolvedBoardRow,
  StayByYouFnbMetric,
} from "../customBoard.types";

function buildTimeSubtitle(
  startTime: string,
  endTime: string
) {
  if (
    startTime &&
    endTime
  ) {
    return `${startTime}–${endTime}`;
  }

  return (
    startTime ||
    endTime ||
    undefined
  );
}

function getServicesForItem(
  item: CustomBoardItem,
  services: FnbDashboardService[]
) {
  /**
   * Aucun sourceId :
   * on travaille sur tous les services
   * de l'hôtel courant.
   */
  if (
    !item.sourceId
  ) {
    return services;
  }

  /**
   * sourceId présent :
   * on cible uniquement ce service.
   */
  return services.filter(
    (
      service
    ) =>
      service.id ===
      item.sourceId
  );
}

function resolveMetric(
  metric: StayByYouFnbMetric,
  selectedServices: FnbDashboardService[]
) {
  const reservations =
    selectedServices.reduce(
      (
        total,
        service
      ) =>
        total +
        service.reservations,
      0
    );

  const capacity =
    selectedServices.reduce(
      (
        total,
        service
      ) =>
        total +
        service.capacity,
      0
    );

  switch (
    metric
  ) {
    case "reservations":
      return {
        value:
          reservations,

        editable:
          selectedServices.length ===
          1,

        capacity:
          undefined,

        text:
          undefined,
      };

    case "capacity":
      return {
        value:
          capacity,

        editable:
          false,

        capacity:
          undefined,

        text:
          undefined,
      };

    case "occupancy_rate": {
      const rate =
        capacity > 0
          ? Math.round(
              (
                reservations /
                capacity
              ) *
                100
            )
          : 0;

      return {
        value:
          undefined,

        editable:
          false,

        capacity:
          undefined,

        text:
          `${rate}%`,
      };
    }

    case "services_count":
      return {
        value:
          selectedServices.length,

        editable:
          false,

        capacity:
          undefined,

        text:
          undefined,
      };
  }
}

export function resolveStayByYouFnbBoardRow(
  item:
    CustomBoardItem,

  services:
    FnbDashboardService[]
): ResolvedBoardRow | null {
  const selectedServices =
    getServicesForItem(
      item,
      services
    );

  /**
   * Un service spécifique a été configuré
   * mais n'existe plus ou n'est plus actif.
   */
  if (
    item.sourceId &&
    selectedServices.length ===
      0
  ) {
    return null;
  }

  const metric:
    StayByYouFnbMetric =
    item.metric ===
      "capacity" ||
    item.metric ===
      "occupancy_rate" ||
    item.metric ===
      "services_count"
      ? item.metric
      : "reservations";

  const metricData =
    resolveMetric(
      metric,
      selectedServices
    );

  const specificService =
    selectedServices.length ===
      1 &&
    item.sourceId
      ? selectedServices[0]
      : null;

  const subtitle =
    item.subtitle ||
    (
      specificService
        ? buildTimeSubtitle(
            specificService.startTime,
            specificService.endTime
          )
        : undefined
    );

  const row:
    ResolvedBoardRow = {
      id:
        item.id,

      label:
        item.label,

      displayType:
        item.type,

      editable:
        metricData.editable,
    };

  if (
    metricData.value !==
    undefined
  ) {
    row.value =
      metricData.value;
  }

  if (
    metricData.capacity !==
    undefined
  ) {
    row.capacity =
      metricData.capacity;
  }

  if (
    metricData.text !==
    undefined
  ) {
    row.text =
      metricData.text;
  }

  if (
    subtitle
  ) {
    row.subtitle =
      subtitle;
  }

  return row;
}