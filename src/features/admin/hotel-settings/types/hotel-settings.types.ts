export type HotelSettings = {
  id: string;
  name: string;
  active: boolean;

  timezone: string;

  supportedLanguages: string[];

  roomServiceEnabled: boolean;
  roomServiceSuspended: boolean;
};

export type UpdateHotelSettingsInput = {
  name: string;
  timezone: string;
  supportedLanguages: string[];
};