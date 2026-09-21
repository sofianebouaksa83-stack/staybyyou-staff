export type ClientStay = {
  id: string;
  guestName: string;

  roomId: string;
  roomName: string;
  roomCode: string;

  startsAt: string;
  endsAt: string;

  active: boolean;
};
export type ClientFollowupType =
  | "note"
  | "request"
  | "complaint"
  | "incident"
  | "preference"
  | "vip";

export type ClientFollowupStatus =
  | "open"
  | "in_progress"
  | "resolved";

export type ClientFollowupPriority =
  | "normal"
  | "high"
  | "urgent";

export type ClientFollowup = {
  id: string;
  stayId: string;

  type: ClientFollowupType;
  status: ClientFollowupStatus;
  priority: ClientFollowupPriority;

  content: string;

  createdAt: string;
  resolvedAt: string | null;
};