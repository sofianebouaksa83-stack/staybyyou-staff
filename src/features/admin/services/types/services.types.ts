export type StaffDepartment = {
  id: string;
  hotel_id: string;
  name: string;
  slug: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SaveDepartmentInput = {
  id?: string;
  name: string;
  active: boolean;
};