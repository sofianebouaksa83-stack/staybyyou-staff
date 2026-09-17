import type { Guest } from "../../types";

export const guests: Guest[] = [
  {
    id: "g-1",
    firstName: "Emma",
    lastName: "Martin",
    room: "14",
    arrival: "17 sept.",
    departure: "19 sept.",
    status: "arrival",
    tags: ["VIP 2"],
    preferences: ["Oreiller ferme"],
    timeline: [
      { id:"tl-1", date:"Aujourd’hui · 11:40", department:"Réception", author:"Camille", type:"info", text:"Arrivée prévue vers 17h30." }
    ]
  },
  {
    id: "g-2",
    firstName: "Lucas",
    lastName: "Bernard",
    room: "24",
    arrival: "17 sept.",
    departure: "20 sept.",
    status: "arrival",
    tags: ["Anniversaire"],
    notes: ["Attention anniversaire prévue ce soir."],
    timeline: [
      { id:"tl-2", date:"Aujourd’hui · 14:32", department:"Réception", author:"Sophie", type:"incident", text:"Climatisation signalée comme défectueuse." },
      { id:"tl-3", date:"Aujourd’hui · 14:36", department:"Maintenance", author:"Julien", type:"task", text:"Intervention maintenance créée." }
    ]
  },
  {
    id: "g-3",
    firstName: "Olivia",
    lastName: "Morel",
    room: "08",
    arrival: "16 sept.",
    departure: "19 sept.",
    status: "stay",
    tags: ["VIP 3"],
    preferences: ["Petit-déjeuner sans gluten"],
    timeline: [
      { id:"tl-4", date:"Hier · 20:15", department:"Restaurant", author:"Thomas", type:"positive", text:"Très satisfaite du dîner." }
    ]
  },
  {
    id: "g-4",
    firstName: "James",
    lastName: "Wilson",
    room: "32",
    arrival: "13 sept.",
    departure: "17 sept.",
    status: "departure",
    tags: ["Honeymoon"],
    timeline: [
      { id:"tl-5", date:"Aujourd’hui · 09:12", department:"Réception", author:"Léa", type:"info", text:"Late check-out accordé jusqu’à 13h." }
    ]
  },
  {
    id: "g-5",
    firstName: "Charlotte",
    lastName: "Petit",
    room: "05",
    arrival: "15 sept.",
    departure: "18 sept.",
    status: "stay",
    tags: [],
    timeline: []
  }
];
