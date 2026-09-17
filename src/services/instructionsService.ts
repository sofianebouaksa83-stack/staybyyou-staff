import { supabase } from "./supabase";

export type InstructionShift =
  | "all"
  | "morning"
  | "day"
  | "evening"
  | "night";

export type InstructionPriority =
  | "normal"
  | "high"
  | "urgent";

export type StaffInstruction = {
  id: string;
  hotel_id: string;
  department_id: string | null;
  instruction_date: string;
  shift: InstructionShift;
  title: string;
  content: string;
  priority: InstructionPriority;
  pinned: boolean;
  active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function getInstructions(
  hotelId: string,
  date: string
) {
  const { data, error } = await supabase
    .from("staff_instructions")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("instruction_date", date)
    .eq("active", true)
    .order("pinned", {
      ascending: false,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as StaffInstruction[];
}

export async function createInstruction({
  hotelId,
  date,
  title,
  content,
  shift,
  priority,
  departmentId = null,
  pinned = false,
}: {
  hotelId: string;
  date: string;
  title: string;
  content: string;
  shift: InstructionShift;
  priority: InstructionPriority;
  departmentId?: string | null;
  pinned?: boolean;
}) {
  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const { data, error } =
    await supabase
      .from("staff_instructions")
      .insert({
        hotel_id: hotelId,
        department_id:
          departmentId,
        instruction_date:
          date,
        shift,
        title:
          title.trim(),
        content:
          content.trim(),
        priority,
        pinned,
        active: true,
        created_by:
          authData.user.id,
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffInstruction;
}

export async function updateInstruction(
  id: string,
  updates: Partial<{
    title: string;
    content: string;
    shift: InstructionShift;
    priority: InstructionPriority;
    pinned: boolean;
    active: boolean;
    department_id:
      | string
      | null;
  }>
) {
  const {
    data: authData,
  } =
    await supabase.auth.getUser();

  const { data, error } =
    await supabase
      .from("staff_instructions")
      .update({
        ...updates,
        updated_by:
          authData.user?.id ??
          null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data as StaffInstruction;
}

export async function deleteInstruction(
  id: string
) {
  const { error } =
    await supabase
      .from("staff_instructions")
      .delete()
      .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function markInstructionAsRead(
  instructionId: string
) {
  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const { error } =
    await supabase
      .from("staff_instruction_reads")
      .upsert(
        {
          instruction_id:
            instructionId,
          user_id:
            authData.user.id,
          read_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "instruction_id,user_id",
        }
      );

  if (error) {
    throw error;
  }
}

export async function getReadInstructionIds(
  instructionIds: string[]
) {
  if (
    instructionIds.length === 0
  ) {
    return [];
  }

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!authData.user) {
    return [];
  }

  const { data, error } =
    await supabase
      .from("staff_instruction_reads")
      .select("instruction_id")
      .eq(
        "user_id",
        authData.user.id
      )
      .in(
        "instruction_id",
        instructionIds
      );

  if (error) {
    throw error;
  }

  return (
    data?.map(
      (row) =>
        row.instruction_id
    ) ?? []
  );
}