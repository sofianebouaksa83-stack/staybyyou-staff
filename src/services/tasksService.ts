import { supabase } from "./supabase";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "done"
  | "cancelled";

export type TaskPriority =
  | "normal"
  | "high"
  | "urgent";

export type StaffTask = {
  id: string;
  hotel_id: string;
  department_id: string | null;
  room_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string | null;
  due_at: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

export async function getTasks(
  hotelId: string,
  date: string
) {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const { data, error } = await supabase
    .from("staff_tasks")
    .select("*")
    .eq("hotel_id", hotelId)
    .gte("due_at", start)
    .lte("due_at", end)
    .neq("status", "cancelled")
    .order("due_at", {
      ascending: true,
    });

  if (error) throw error;

  return (data ?? []) as StaffTask[];
}

export async function createTask({
  hotelId,
  title,
  description,
  dueAt,
  priority = "normal",
  roomId = null,
  departmentId = null,
  assignedTo = null,
}: {
  hotelId: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  priority?: TaskPriority;
  roomId?: string | null;
  departmentId?: string | null;
  assignedTo?: string | null;
}) {
  const {
    data: userData,
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("staff_tasks")
    .insert({
      hotel_id: hotelId,
      title,
      description: description ?? null,
      due_at: dueAt ?? null,
      priority,
      room_id: roomId,
      department_id: departmentId,
      assigned_to: assignedTo,
      created_by:
        userData.user?.id ?? null,
      status: "todo",
      source: "staff",
    })
    .select()
    .single();

  if (error) throw error;

  return data as StaffTask;
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    due_at: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    room_id: string | null;
    department_id: string | null;
    assigned_to: string | null;
  }>
) {
  const { data, error } = await supabase
    .from("staff_tasks")
    .update({
      ...updates,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as StaffTask;
}

export async function deleteTask(
  id: string
) {
  const { error } = await supabase
    .from("staff_tasks")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function subscribeToTasks(
  hotelId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`staff-tasks-${hotelId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "staff_tasks",
        filter: `hotel_id=eq.${hotelId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}