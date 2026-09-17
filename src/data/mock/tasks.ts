import type { Task } from "../../types";

export const tasks: Task[] = [
  {
    id:"t-1",
    title:"Vérifier la climatisation",
    description:"Client chambre 24 signale que la climatisation ne fonctionne plus.",
    location:"Chambre 24",
    department:"Maintenance",
    assignee:"Julien",
    priority:"high",
    status:"todo",
    due:"17:00"
  },
  {
    id:"t-2",
    title:"Préparer attention anniversaire",
    description:"Préparer l’attention prévue pour l’arrivée.",
    location:"Chambre 14",
    department:"Cuisine",
    assignee:"Sofiane",
    priority:"normal",
    status:"doing",
    due:"18:00"
  },
  {
    id:"t-3",
    title:"Serviettes supplémentaires",
    location:"Villa 3",
    department:"Housekeeping",
    assignee:"Julie",
    priority:"normal",
    status:"done"
  },
  {
    id:"t-4",
    title:"Contrôler mini-bar",
    location:"Chambre 08",
    department:"Housekeeping",
    priority:"normal",
    status:"todo",
    due:"16:30"
  }
];
