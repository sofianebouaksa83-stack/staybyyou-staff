import type {
  WidgetSize,
} from "../layout/dashboardLayout.types";

export type CustomBoardRowType =
  | "value"
  | "value_capacity"
  | "text"
  | "status"
  | "time";

export type CustomBoardSource =
  | "manual"
  | "staybyyou_fnb"
  | "staybyyou_hotel"
  | "staybyyou_room_service"
  | "sevenrooms"
  | "opera";

export type StayByYouHotelMetric =
  | "arrivals"
  | "departures"
  | "in_house"
  | "room_count"
  | "occupancy_rate";  

export type StayByYouFnbMetric =
  | "reservations"
  | "capacity"
  | "occupancy_rate"
  | "services_count";

export type CustomBoardMetric =
  | StayByYouFnbMetric
  | StayByYouHotelMetric;

export type CustomBoardDensity =
  | "compact"
  | "comfortable";

export type CustomBoardManualData = {
  value:
    number | null;

  capacity:
    number | null;

  text:
    string | null;

  status:
    string | null;

  startTime:
    string | null;

  endTime:
    string | null;
};

export type CustomBoardPresetKey =
  | "blank"
  | "fnb_services"
  | "hotel_overview";

/**
 * Configuration persistée d'une ligne.
 *
 * Elle décrit :
 * - son affichage ;
 * - sa source ;
 * - l'identifiant éventuel dans cette source ;
 * - ses données manuelles éventuelles.
 */
export type CustomBoardItem = {
  id: string;

  label: string;

  subtitle: string;

  type:
    CustomBoardRowType;

  source:
    CustomBoardSource;

  sourceId:
    string | null;

  metric:
    CustomBoardMetric | null;

  manual:
    CustomBoardManualData;
};

/**
 * Format commun consommé par le composant visuel.
 *
 * Aucune connaissance de Supabase ou d'une API externe.
 */
export type ResolvedBoardRow = {
  id: string;

  label: string;

  displayType:
    CustomBoardRowType;

  subtitle?:
    string;

  value?:
    number;

  capacity?:
    number;

  text?:
    string;

  status?:
    string;

  startTime?:
    string;

  endTime?:
    string;

  updatedAt?:
    string;

  editable?:
    boolean;
};

export type CustomBoardSettings = {
  preset:
  CustomBoardPresetKey | null;
  
  title: string;

  eyebrow: string;

  size:
    WidgetSize;

  density:
    CustomBoardDensity;

  showSubtitle:
    boolean;

  showValue:
    boolean;

  showCapacity:
    boolean;

  items:
    CustomBoardItem[];
  
  
};