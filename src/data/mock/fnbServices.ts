export type FnbServiceStatus = "low" | "medium" | "high";

export interface FnbService {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  reservations: number;
  capacity: number;
  enabled: boolean;
  order: number;
}

export const fnbServices: FnbService[] = [
  {
    id: "spa",
    name: "Spa",
    startTime: "10:00",
    endTime: "19:00",
    reservations: 15,
    capacity: 40,
    enabled: true,
    order: 1,
  },
  {
    id: "breakfast",
    name: "Petit déjeuner",
    startTime: "07:30",
    endTime: "10:30",
    reservations: 41,
    capacity: 100,
    enabled: true,
    order: 2,
  },
  {
    id: "bistrot-lunch",
    name: "Bistrot - Midi",
    startTime: "12:00",
    endTime: "14:30",
    reservations: 62,
    capacity: 130,
    enabled: true,
    order: 3,
  },
  {
    id: "bistrot-dinner",
    name: "Bistrot - Soir",
    startTime: "19:00",
    endTime: "21:30",
    reservations: 8,
    capacity: 60,
    enabled: true,
    order: 4,
  },
  {
    id: "jardin",
    name: "Le Jardin de Benjamin",
    startTime: "19:00",
    endTime: "21:30",
    reservations: 29,
    capacity: 50,
    enabled: true,
    order: 5,
  },
  {
    id: "bar",
    name: "Bar Château",
    startTime: "12:00",
    endTime: "00:00",
    reservations: 0,
    capacity: 0,
    enabled: true,
    order: 6,
  },
];

export function getOccupancyStatus(
  reservations: number,
  capacity: number
): FnbServiceStatus {
  if (capacity <= 0) return "low";

  const percentage = reservations / capacity;

  if (percentage >= 0.75) return "high";
  if (percentage >= 0.45) return "medium";

  return "low";
}