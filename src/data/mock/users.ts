import type { User } from "../../types";

export const demoUsers: User[] = [
  {
    id: "u-employee",
    firstName: "Sofiane",
    lastName: "B.",
    role: "read_only",
    departments: ["Cuisine"],
    hotelId: "hotel-berne",
    hotelName: "Château de Berne",
  },
  {
    id: "u-manager",
    firstName: "Camille",
    lastName: "M.",
    role: "manager",
    departments: ["Réception"],
    hotelId: "hotel-berne",
    hotelName: "Château de Berne",
  },
  {
    id: "u-direction",
    firstName: "Alexandre",
    lastName: "D.",
    role: "manager",
    departments: ["Direction"],
    hotelId: "hotel-berne",
    hotelName: "Château de Berne",
  },
  {
    id: "u-admin",
    firstName: "Admin",
    lastName: "Demo",
    role: "admin",
    departments: ["Direction"],
    hotelId: "hotel-berne",
    hotelName: "Château de Berne",
  },
];
