import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useApp } from "../../app/AppContext";

export function DateNavigator() {
  const {
    selectedDate,
    setSelectedDate,
  } = useApp();

  function changeDay(offset: number) {
    const nextDate =
      new Date(selectedDate);

    nextDate.setDate(
      selectedDate.getDate() + offset
    );

    setSelectedDate(nextDate);
  }

  function goToday() {
    setSelectedDate(
      new Date(2026, 8, 17)
    );
  }

  const formattedDate =
    selectedDate.toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  return (
    <div className="date-navigator">
      <button
        onClick={() => changeDay(-1)}
        aria-label="Jour précédent"
      >
        <ChevronLeft size={17} />
      </button>

      <div className="date-navigator-current">
        <CalendarDays size={16} />

        <span>
          {formattedDate}
        </span>
      </div>

      <button
        onClick={() => changeDay(1)}
        aria-label="Jour suivant"
      >
        <ChevronRight size={17} />
      </button>

      <button
        className="date-today-button"
        onClick={goToday}
      >
        Aujourd'hui
      </button>
    </div>
  );
}