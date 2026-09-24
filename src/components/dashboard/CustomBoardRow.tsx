import {
  useEffect,
  useState,
} from "react";

import type {
  ResolvedBoardRow,
} from "../../features/widgets/custom-board/customBoard.types";

type Props = {
  row:
    ResolvedBoardRow;

  showSubtitle:
    boolean;

  showValue:
    boolean;

  showCapacity:
    boolean;

  onValueChange?: (
    value: number
  ) => Promise<boolean>;
};

function getOccupancyLevel(
  value:
    number,

  capacity:
    number
) {
  if (
    capacity <= 0
  ) {
    return "low";
  }

  const ratio =
    value /
    capacity;

  if (
    ratio >=
    0.75
  ) {
    return "high";
  }

  if (
    ratio >=
    0.45
  ) {
    return "medium";
  }

  return "low";
}

export function CustomBoardRow({
  row,
  showSubtitle,
  showValue,
  showCapacity,
  onValueChange,
}: Props) {
  const [
    draftValue,
    setDraftValue,
  ] = useState(
    row.value !==
      undefined
      ? String(
          row.value
        )
      : ""
  );

  useEffect(
    () => {
      setDraftValue(
        row.value !==
          undefined
          ? String(
              row.value
            )
          : ""
      );
    },
    [
      row.value,
    ]
  );

  const numericDraft =
    Number.isFinite(
      Number(
        draftValue
      )
    )
      ? Math.max(
          0,
          Number(
            draftValue
          )
        )
      : 0;

  const occupancyLevel =
    row.capacity !==
      undefined
      ? getOccupancyLevel(
          numericDraft,
          row.capacity
        )
      : "low";

  async function commitValue() {
    if (
      !onValueChange
    ) {
      return;
    }

    const nextValue =
      Math.max(
        0,
        Number(
          draftValue
        ) || 0
      );

    setDraftValue(
      String(
        nextValue
      )
    );

    const success =
      await onValueChange(
        nextValue
      );

    if (
      !success
    ) {
      setDraftValue(
        row.value !==
          undefined
          ? String(
              row.value
            )
          : ""
      );
    }
  }

  function renderValue() {
    if (
      !showValue
    ) {
      return null;
    }

    if (
      onValueChange
    ) {
      return (
        <input
          className={`custom-board-row__number custom-board-row__number--${occupancyLevel}`}
          type="number"
          min="0"
          value={
            draftValue
          }
          onChange={(
            event
          ) =>
            setDraftValue(
              event.target
                .value
            )
          }
          onBlur={() =>
            void commitValue()
          }
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Enter"
            ) {
              event.currentTarget.blur();
            }
          }}
        />
      );
    }

    return (
      <span
        className={`custom-board-row__number custom-board-row__number--${occupancyLevel}`}
      >
        {
          row.value ??
          0
        }
      </span>
    );
  }

  function renderRightContent() {
    switch (
      row.displayType
    ) {
      case "value":
        return renderValue();

      case "value_capacity":
        return (
          <div className="custom-board-row__value">
            {renderValue()}

            {showCapacity &&
              row.capacity !==
                undefined && (
                <span className="custom-board-row__capacity">
                  {" / "}
                  {
                    row.capacity
                  }
                </span>
              )}
          </div>
        );

      case "text":
        return row.text
          ? (
              <span className="custom-board-row__text">
                {
                  row.text
                }
              </span>
            )
          : null;

      case "status":
        return row.status
          ? (
              <span className="custom-board-row__status">
                {
                  row.status
                }
              </span>
            )
          : null;

      case "time": {
        const time =
          row.startTime &&
          row.endTime
            ? `${row.startTime}–${row.endTime}`
            : row.startTime ||
              row.endTime;

        return time
          ? (
              <span className="custom-board-row__text">
                {
                  time
                }
              </span>
            )
          : null;
      }

      default:
        return null;
    }
  }

  return (
    <div className="custom-board-row">
      <div className="custom-board-row__main">
        <strong className="custom-board-row__label">
          {
            row.label
          }
        </strong>

        {showSubtitle &&
          row.subtitle && (
            <small className="custom-board-row__subtitle">
              {
                row.subtitle
              }
            </small>
          )}
      </div>

      <div className="custom-board-row__right">
        {
          renderRightContent()
        }
      </div>
    </div>
  );
}