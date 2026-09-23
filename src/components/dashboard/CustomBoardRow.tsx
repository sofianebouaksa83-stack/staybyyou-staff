import type {
  CustomBoardItem,
} from "../../features/widgets/custom-board/customBoard.types";

type Props = {
  item:
    CustomBoardItem;

  showSubtitle:
    boolean;

  showValue:
    boolean;

  showCapacity:
    boolean;
};

export function CustomBoardRow({
  item,
  showSubtitle,
  showValue,
  showCapacity,
}: Props) {
  return (
    <div className="custom-board-row">
      <div className="custom-board-row__main">
        <strong>
          {item.label}
        </strong>

        {showSubtitle &&
          item.subtitle && (
            <small>
              {item.subtitle}
            </small>
          )}
      </div>

      {showValue && (
        <div className="custom-board-row__value">
          <span>
            {item.value ?? 0}
          </span>

          {showCapacity &&
            item.capacity !==
              null && (
              <b>
                /{" "}
                {item.capacity}
              </b>
            )}
        </div>
      )}
    </div>
  );
}