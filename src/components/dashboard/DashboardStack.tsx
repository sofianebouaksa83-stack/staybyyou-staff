import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DashboardStackItem = {
  id: string;

  title: string;

  content:
    ReactNode;
};

type Props = {
  items:
    DashboardStackItem[];
};

const SWIPE_THRESHOLD =
  45;

export function DashboardStack({
  items,
}: Props) {
  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(
      0
    );

  const touchStartX =
    useRef<
      number | null
    >(
      null
    );

  useEffect(
    () => {
      if (
        items.length ===
        0
      ) {
        setActiveIndex(
          0
        );

        return;
      }

      setActiveIndex(
        (
          current
        ) =>
          Math.min(
            current,
            items.length -
              1
          )
      );
    },
    [
      items.length,
    ]
  );

  if (
    items.length ===
    0
  ) {
    return null;
  }

  const hasMultiple =
    items.length >
    1;

  const activeItem =
    items[
      activeIndex
    ];

  function previous() {
    setActiveIndex(
      (
        current
      ) =>
        current ===
        0
          ? items.length -
            1
          : current -
            1
    );
  }

  function next() {
    setActiveIndex(
      (
        current
      ) =>
        current ===
        items.length -
          1
          ? 0
          : current +
            1
    );
  }

  function handleTouchStart(
    event:
      React.TouchEvent<HTMLDivElement>
  ) {
    touchStartX.current =
      event.touches[
        0
      ]?.clientX ??
      null;
  }

  function handleTouchEnd(
    event:
      React.TouchEvent<HTMLDivElement>
  ) {
    if (
      touchStartX.current ===
      null
    ) {
      return;
    }

    const endX =
      event.changedTouches[
        0
      ]?.clientX;

    if (
      endX ===
      undefined
    ) {
      touchStartX.current =
        null;

      return;
    }

    const distance =
      endX -
      touchStartX.current;

    touchStartX.current =
      null;

    if (
      Math.abs(
        distance
      ) <
      SWIPE_THRESHOLD
    ) {
      return;
    }

    if (
      distance <
      0
    ) {
      next();

      return;
    }

    previous();
  }

  return (
    <div
      className={[
        "dashboard-stack",
        hasMultiple
          ? "dashboard-stack--multiple"
          : "",
      ].join(
        " "
      )}
    >
      <div
        className="dashboard-stack__viewport"
        onTouchStart={
          handleTouchStart
        }
        onTouchEnd={
          handleTouchEnd
        }
      >
        <div
          key={
            activeItem.id
          }
          className="dashboard-stack__slide"
        >
          {
            activeItem.content
          }
        </div>
      </div>

      {hasMultiple && (
        <div className="dashboard-stack__navigation">
          <button
            type="button"
            className="dashboard-stack__arrow dashboard-stack__arrow--previous"
            aria-label="Bloc précédent"
            onClick={
              previous
            }
          >
            <ChevronLeft
              size={
                16
              }
            />
          </button>

          <div className="dashboard-stack__dots">
            {items.map(
              (
                item,
                index
              ) => (
                <button
                  type="button"
                  key={
                    item.id
                  }
                  className={[
                    "dashboard-stack__dot",

                    index ===
                    activeIndex
                      ? "dashboard-stack__dot--active"
                      : "",
                  ].join(
                    " "
                  )}
                  aria-label={`Afficher ${item.title}`}
                  aria-current={
                    index ===
                    activeIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                />
              )
            )}
          </div>

          <button
            type="button"
            className="dashboard-stack__arrow dashboard-stack__arrow--next"
            aria-label="Bloc suivant"
            onClick={
              next
            }
          >
            <ChevronRight
              size={
                16
              }
            />
          </button>
        </div>
      )}
    </div>
  );
}