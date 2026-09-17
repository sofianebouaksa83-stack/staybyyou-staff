import type { Message } from "../../types";

export const messages: Message[] = [
  {
    id:"m-1",
    channelId:"general",
    channelName:"Général",
    author:"Direction",
    authorDepartment:"Direction",
    time:"13:40",
    text:"Briefing équipes à 16h en salle de réunion.",
    unread:true
  },
  {
    id:"m-2",
    channelId:"cuisine",
    channelName:"Cuisine",
    author:"Réception",
    authorDepartment:"Réception",
    time:"14:32",
    text:"Chambre 24 souhaite dîner en chambre ce soir.",
    unread:true
  },
  {
    id:"m-3",
    channelId:"maintenance",
    channelName:"Maintenance",
    author:"Sophie",
    authorDepartment:"Réception",
    time:"14:18",
    text:"Climatisation chambre 24 signalée comme défectueuse."
  },
  {
    id:"m-4",
    channelId:"general",
    channelName:"Général",
    author:"Camille",
    authorDepartment:"Réception",
    time:"14:44",
    text:"Les arrivées VIP sont à jour pour ce soir."
  }
];

export const channels = [
  "Général",
  "Réception",
  "Cuisine",
  "Housekeeping",
  "Maintenance",
  "Restaurant",
  "Room Service"
];
