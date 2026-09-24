import type {
  FnbDashboardService,
} from "../fnb/useFnbDashboardData";

import {
  resolveManualBoardRow,
} from "./adapters/manualBoard.adapter";

import {
  resolveStayByYouFnbBoardRow,
} from "./adapters/staybyyouFnbBoard.adapter";

import {
  resolveStayByYouHotelBoardRow,
} from "./adapters/staybyyouHotelBoard.adapter";

import type {
  StayByYouHotelBoardData,
} from "./adapters/staybyyouHotelBoard.adapter";

import type {
  CustomBoardItem,
  ResolvedBoardRow,
} from "./customBoard.types";

export type CustomBoardResolverContext = {
  staybyyouFnbServices?:
    FnbDashboardService[];

  staybyyouHotel?:
    StayByYouHotelBoardData;
};

export function resolveCustomBoardItem(
  item:
    CustomBoardItem,

  context:
    CustomBoardResolverContext = {}
): ResolvedBoardRow | null {
  switch (
    item.source
  ) {
    case "manual":
      return resolveManualBoardRow(
        item
      );

    case "staybyyou_fnb":
      return resolveStayByYouFnbBoardRow(
        item,
        context.staybyyouFnbServices ??
          []
      );

    case "staybyyou_hotel":
      if (
        !context.staybyyouHotel
      ) {
        return null;
      }

      return resolveStayByYouHotelBoardRow(
        item,
        context.staybyyouHotel
      );

    case "staybyyou_room_service":
    case "sevenrooms":
    case "opera":
      return null;

    default:
      return null;
  }
}

export function resolveCustomBoardItems(
  items:
    CustomBoardItem[],

  context:
    CustomBoardResolverContext = {}
): ResolvedBoardRow[] {
  return items.flatMap(
    (
      item
    ) => {
      const resolved =
        resolveCustomBoardItem(
          item,
          context
        );

      return resolved
        ? [
            resolved,
          ]
        : [];
    }
  );
}