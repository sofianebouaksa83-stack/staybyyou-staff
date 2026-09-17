import type { Instruction } from "../../types";

export const instructions: Instruction[] = [
  {
    id:"i-1",
    department:"Cuisine",
    title:"Chambre froide pâtisserie",
    text:"Ne pas utiliser jusqu’à nouvel ordre. Intervention maintenance prévue.",
    expiresAt:"Vendredi",
    author:"Direction F&B"
  },
  {
    id:"i-2",
    department:"Tous",
    title:"Briefing équipes",
    text:"Briefing à 16h en salle de réunion.",
    expiresAt:"Aujourd’hui",
    author:"Direction"
  }
];
