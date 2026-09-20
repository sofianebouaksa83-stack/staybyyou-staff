export type StaffRole =
  | "owner"
  | "admin"
  | "manager"
  | "kitchen"
  | "reception"
  | "delivery"
  | "bedroom"
  | "read_only";

export type InviteRole = Exclude<
  StaffRole,
  "owner" | "read_only"
>;

export type StaffDepartment = {
  id: string;
  name?: string | null;
};

export type DepartmentRelation =
  | StaffDepartment
  | StaffDepartment[]
  | null;

export type MemberDepartmentRow = {
  is_primary?: boolean | null;
  staff_departments?: DepartmentRelation;
};

export type StaffMember = {
  id: string;
  user_id: string;
  hotel_id: string;
  display_name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  created_at: string;

  staff_member_departments?:
    | MemberDepartmentRow[]
    | null;
};

export type StaffInvitation = {
  id: string;
  hotel_id: string;
  email: string;
  role: StaffRole;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export type InviteUserInput = {
  hotelId: string;
  email: string;
  role: InviteRole;
};

export type InviteUserResult = {
  ok: boolean;
  message?: string;
  token?: string;
};