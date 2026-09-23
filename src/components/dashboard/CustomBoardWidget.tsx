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
  settings,
  canConfigure = false,
  onSettingsChange,
}: DashboardWidgetComponentProps) {
  const parsed =
    readCustomBoardSettings(
      settings
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

        {parsed.items.length ===
        0 ? (
          <p className="custom-board__empty">
            Aucun élément.
          </p>
        ) : (
          <div className="custom-board__rows">
            {parsed.items.map(
              (
                item
              ) => (
                <CustomBoardRow
                  key={
                    item.id
                  }
                  item={
                    item
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