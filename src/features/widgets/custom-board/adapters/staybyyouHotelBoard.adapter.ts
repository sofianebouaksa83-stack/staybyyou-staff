import type {
  CustomBoardItem,
  ResolvedBoardRow,
  StayByYouHotelMetric,
} from "../customBoard.types";

export type StayByYouHotelBoardData = {
  arrivalsCount:
    number;

  departuresCount:
    number;

  inHouseCount:
    number;

  roomCount:
    number;

  occupancyRate:
    number;

  loading:
    boolean;
};

type HotelMetricResult = {
  value?:
    number;

  text?:
    string;

  editable:
    boolean;
};

function resolveMetric(
  metric:
    StayByYouHotelMetric,

  data:
    StayByYouHotelBoardData
): HotelMetricResult {
  switch (
    metric
  ) {
    case "arrivals":
      return {
        value:
          data.arrivalsCount,

        editable:
          false,
      };

    case "departures":
      return {
        value:
          data.departuresCount,

        editable:
          false,
      };

    case "in_house":
      return {
        value:
          data.inHouseCount,

        editable:
          false,
      };

    case "room_count":
      return {
        value:
          data.roomCount,

        editable:
          false,
      };

    case "occupancy_rate":
      return {
        text:
          `${data.occupancyRate}%`,

        editable:
          false,
      };
  }
}

export function resolveStayByYouHotelBoardRow(
  item:
    CustomBoardItem,

  data:
    StayByYouHotelBoardData
): ResolvedBoardRow {
  const metric =
    (
      item.metric ??
      "in_house"
    ) as StayByYouHotelMetric;

  const result =
    resolveMetric(
      metric,
      data
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
        result.editable,
    };

  if (
    result.value !==
    undefined
  ) {
    row.value =
      result.value;
  }

  if (
    result.text !==
    undefined
  ) {
    row.text =
      result.text;
  }

  if (
    item.subtitle
  ) {
    row.subtitle =
      item.subtitle;
  }

  return row;
}