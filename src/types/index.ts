export type Role = "employee" | "manager" | "direction" | "admin";
export type Department =
  | "Cuisine"
  | "Réception"
  | "Housekeeping"
  | "Maintenance"
  | "Restaurant"
  | "Room Service"
  | "Spa"
  | "Direction";

export type GuestStatus = "arrival" | "stay" | "departure";
export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "normal" | "high" | "urgent";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  departments: Department[];
  hotelId: string;
  hotelName: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  room: string;
  arrival: string;
  departure: string;
  status: GuestStatus;
  tags: string[];
  notes?: string[];
  preferences?: string[];
  timeline?: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  date: string;
  department: Department;
  author: string;
  type: "info" | "incident" | "task" | "positive";
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  location?: string;
  department: Department;
  assignee?: string;
  priority: Priority;
  status: TaskStatus;
  due?: string;
}

export interface Message {
  id: string;
  channelId: string;
  channelName: string;
  author: string;
  authorDepartment: Department;
  time: string;
  text: string;
  unread?: boolean;
}

export interface Instruction {
  id: string;
  department: Department | "Tous";
  title: string;
  text: string;
  expiresAt?: string;
  author: string;
}

export interface HotelEvent {
  id: string;
  date: string;
  title: string;
  attendees: number;
  departments: Department[];
  location: string;
}
