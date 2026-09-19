import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import { useApp } from "../../app/AppContext";

export function DateNavigator() {
  const location = useLocation();

  const {
    selectedDate,
    setSelectedDate,
  } = useApp();

  const isMessagesPage =
    location.pathname === "/messages" ||
    location.pathname.startsWith(
      "/messages/"
    );

  if (isMessagesPage) {
    return null;
  }

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
      new Date()
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
        type="button"
        onClick={() =>
          changeDay(-1)
        }
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
        type="button"
        onClick={() =>
          changeDay(1)
        }
        aria-label="Jour suivant"
      >
        <ChevronRight size={17} />
      </button>

      <button
        type="button"
        className="date-today-button"
        onClick={goToday}
      >
        Aujourd'hui
      </button>
    </div>
  );
}