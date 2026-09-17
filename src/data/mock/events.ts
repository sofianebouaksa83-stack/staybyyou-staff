import type { HotelEvent } from "../../types";

export const hotelEvents: HotelEvent[] = [
  {
    id:"e-1",
    date:"19 SEPT",
    title:"Mariage Martin",
    attendees:120,
    departments:["Cuisine","Restaurant","Réception","Housekeeping"],
    location:"Bastide"
  },
  {
    id:"e-2",
    date:"21 SEPT",
    title:"Séminaire Horizon",
    attendees:48,
    departments:["Réception","Restaurant"],
    location:"Salon Provence"
  },
  {
    id:"e-3",
    date:"24 SEPT",
    title:"Dîner privé",
    attendees:22,
    departments:["Cuisine","Restaurant"],
    location:"Chef's Table"
  }
];
