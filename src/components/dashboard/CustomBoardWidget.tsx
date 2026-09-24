import {
  useEffect,
  useState,
} from "react";

import {
  Settings,
} from "lucide-react";

import {
  readCustomBoardSettings,
} from "../../features/widgets/custom-board/customBoard.helpers";

import {
  updateCustomBoardItemValue,
} from "../../features/widgets/custom-board/customBoard.mutations";

import {
  resolveCustomBoardItems,
} from "../../features/widgets/custom-board/customBoard.resolver";

import type {
  CustomBoardSettings,
} from "../../features/widgets/custom-board/customBoard.types";

import type {
  DashboardWidgetComponentProps,
} from "../../features/widgets/registry/widgetRegistry.types";

import {
  CustomBoardRow,
} from "./CustomBoardRow";

import {
  CustomBoardSettingsModal,
} from "./CustomBoardSettingsModal";

export function CustomBoardWidget({
  data,
  settings,
  canConfigure = false,
  onSettingsChange,
}: DashboardWidgetComponentProps) {
  const parsed =
    readCustomBoardSettings(
      settings
    );

  const resolvedRows =
    resolveCustomBoardItems(
      parsed.items,
      {
        staybyyouFnbServices:
          data.fnb.services,

        staybyyouHotel: {
          arrivalsCount:
            data.arrivalsCount,

          departuresCount:
            data.departuresCount,

          inHouseCount:
            data.inHouseCount,

          roomCount:
            data.roomCount,

          occupancyRate:
            data.occupancyRate,

          loading:
            data.loadingHotel,
        },
      }
    );

  const [
    configOpen,
    setConfigOpen,
  ] =
    useState(false);

  const [
    draft,
    setDraft,
  ] =
    useState<
      CustomBoardSettings
    >(
      parsed
    );

  useEffect(
    () => {
      if (
        !configOpen
      ) {
        setDraft(
          parsed
        );
      }
    },

    [
      settings,
      configOpen,
    ]
  );

  async function save() {
    if (
      !onSettingsChange
    ) {
      return;
    }

    const success =
      await onSettingsChange({
        ...settings,

        ...draft,
      });

    if (
      success
    ) {
      setConfigOpen(
        false
      );
    }
  }

  async function handleValueChange(
    rowId: string,
    value: number
  ) {
    if (
      !onSettingsChange
    ) {
      return false;
    }

    const result =
      await updateCustomBoardItemValue(
        parsed.items,
        rowId,
        value,
        {
          updateStayByYouFnbReservations:
            data.fnb.updateReservations,
        }
      );

    if (
      !result.success
    ) {
      return false;
    }

    /**
     * Une mutation externe comme F&B
     * n'a rien à enregistrer dans les
     * settings du CustomBoard.
     */
    if (
      !result.items
    ) {
      return true;
    }

    return onSettingsChange({
      ...settings,

      items:
        result.items,
    });
  }

  return (
    <>
      <section
        className={`custom-board custom-board--${parsed.density}`}
      >
        <header className="custom-board__header">
          <div>
            {parsed.eyebrow && (
              <span>
                {parsed.eyebrow}
              </span>
            )}

            <h2>
              {parsed.title}
            </h2>
          </div>

          {canConfigure &&
            onSettingsChange && (
              <button
                type="button"
                onClick={() =>
                  setConfigOpen(
                    true
                  )
                }
                aria-label="Configurer le bloc"
              >
                <Settings
                  size={16}
                />
              </button>
            )}
        </header>

        {resolvedRows.length ===
        0 ? (
          <p className="custom-board__empty">
            Aucun élément.
          </p>
        ) : (
          <div className="custom-board__rows">
            {resolvedRows.map(
              (
                row
              ) => (
                <CustomBoardRow
                  key={
                    row.id
                  }
                  row={
                    row
                  }
                  showSubtitle={
                    parsed.showSubtitle
                  }
                  showValue={
                    parsed.showValue
                  }
                  showCapacity={
                    parsed.showCapacity
                  }
                  onValueChange={
                    canConfigure &&
                    onSettingsChange &&
                    row.editable
                      ? (
                          value
                        ) =>
                          handleValueChange(
                            row.id,
                            value
                          )
                      : undefined
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {configOpen && (
        <CustomBoardSettingsModal
          value={
            draft
          }
          fnbServices={
            data.fnb.services
          }
          onChange={
            setDraft
          }
          onSave={() =>
            void save()
          }
          onClose={() =>
            setConfigOpen(
              false
            )
          }
        />
      )}
    </>
  );
}