import type {
  CustomBoardItem,
} from "./customBoard.types";

export type CustomBoardMutationContext = {
  updateStayByYouFnbReservations?: (
    serviceId: string,
    reservations: number
  ) => Promise<boolean>;
};

export type CustomBoardValueMutationResult = {
  success: boolean;

  /**
   * Présent uniquement lorsqu'une modification
   * des settings du CustomBoard est nécessaire.
   *
   * Exemple : source manual.
   */
  items?: CustomBoardItem[];
};

function sanitizeValue(
  value: number
) {
  return Math.max(
    0,
    Number.isFinite(value)
      ? value
      : 0
  );
}

function updateManualItemValue(
  items: CustomBoardItem[],
  itemId: string,
  value: number
): CustomBoardItem[] {
  const safeValue =
    sanitizeValue(
      value
    );

  return items.map(
    (
      item
    ) => {
      if (
        item.id !== itemId ||
        item.source !== "manual"
      ) {
        return item;
      }

      return {
        ...item,

        manual: {
          ...item.manual,

          value:
            safeValue,
        },

        /**
         * Compatibilité temporaire
         * avec l'ancien format.
         */
        value:
          safeValue,
      };
    }
  );
}

/**
 * Route toute modification de valeur
 * vers la bonne source.
 *
 * Le composant CustomBoardWidget n'a donc
 * pas besoin de connaître la logique F&B.
 */
export async function updateCustomBoardItemValue(
  items: CustomBoardItem[],
  itemId: string,
  value: number,
  context: CustomBoardMutationContext = {}
): Promise<CustomBoardValueMutationResult> {
  const item =
    items.find(
      (
        current
      ) =>
        current.id ===
        itemId
    );

  if (!item) {
    return {
      success: false,
    };
  }

  const safeValue =
    sanitizeValue(
      value
    );

  switch (
    item.source
  ) {
    case "manual":
      return {
        success: true,

        items:
          updateManualItemValue(
            items,
            itemId,
            safeValue
          ),
      };

    case "staybyyou_fnb": {
      if (
        !item.sourceId ||
        !context.updateStayByYouFnbReservations
      ) {
        return {
          success: false,
        };
      }

      const success =
        await context.updateStayByYouFnbReservations(
          item.sourceId,
          safeValue
        );

      return {
        success,
      };
    }

    /**
     * Sources prévues mais pas encore
     * modifiables.
     */
    case "staybyyou_hotel":
    case "staybyyou_room_service":
    case "sevenrooms":
    case "opera":
      return {
        success: false,
      };

    default:
      return {
        success: false,
      };
  }
}