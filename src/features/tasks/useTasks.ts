import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useApp } from "../../app/AppContext";
import { can } from "../permissions/permissions";

import {
  createTask,
  deleteTask,
  getTasks,
  subscribeToTasks,
  updateTask,
  type StaffTask,
  type TaskPriority,
  type TaskStatus,
} from "../../services/tasksService";

export const taskColumns: {
  status: TaskStatus;
  label: string;
}[] = [
  {
    status: "todo",
    label: "À faire",
  },
  {
    status: "in_progress",
    label: "En cours",
  },
  {
    status: "done",
    label: "Terminées",
  },
];

export function formatTaskDateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useTasks() {
  const {
    user,
    hotelId,
    selectedDate,
  } = useApp();

  const canCreate = can(
    user.role,
    "tasks.create"
  );

  const canEdit =
    [
      "owner",
      "admin",
      "manager",
    ].includes(
      String(user.role)
    );

  const [
    tasks,
    setTasks,
  ] = useState<StaffTask[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!hotelId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);

        const rows =
          await getTasks(
            hotelId!,
            formatTaskDateKey(
              selectedDate
            )
          );

        if (!cancelled) {
          setTasks(rows);
        }
      } catch (err) {
        console.error(
          "Erreur chargement tâches :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger les tâches."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    selectedDate,
  ]);

  useEffect(() => {
    if (!hotelId) {
      return;
    }

    const unsubscribe =
      subscribeToTasks(
        hotelId,
        async () => {
          try {
            const rows =
              await getTasks(
                hotelId,
                formatTaskDateKey(
                  selectedDate
                )
              );

            setTasks(rows);
          } catch (err) {
            console.error(
              "Erreur refresh realtime tâches :",
              err
            );
          }
        }
      );

    return unsubscribe;
  }, [
    hotelId,
    selectedDate,
  ]);

  const tasksByStatus =
    useMemo(() => {
      const map =
        new Map<
          TaskStatus,
          StaffTask[]
        >();

      taskColumns.forEach(
        (column) => {
          map.set(
            column.status,
            tasks.filter(
              (task) =>
                task.status ===
                column.status
            )
          );
        }
      );

      return map;
    }, [tasks]);

  async function addTask(
    values: {
      title: string;
      description: string;
      date: string;
      time: string;
      priority: TaskPriority;
    }
  ) {
    if (
      !hotelId ||
      !values.title.trim()
    ) {
      return;
    }

    try {
      setError(null);

      const dueAt =
        new Date(
          `${values.date}T${values.time}:00`
        ).toISOString();

      const created =
        await createTask({
          hotelId,
          title:
            values.title.trim(),
          description:
            values.description.trim() ||
            null,
          dueAt,
          priority:
            values.priority,
        });

      setTasks(
        (previous) =>
          [
            ...previous,
            created,
          ].sort(
            (a, b) =>
              new Date(
                a.due_at ?? 0
              ).getTime() -
              new Date(
                b.due_at ?? 0
              ).getTime()
          )
      );
    } catch (err) {
      console.error(
        "Erreur création tâche :",
        err
      );

      setError(
        "Impossible de créer la tâche."
      );

      throw err;
    }
  }

  async function changeStatus(
    task: StaffTask,
    status: TaskStatus
  ) {
    if (!canEdit) {
      return;
    }

    const oldStatus =
      task.status;

    setTasks(
      (previous) =>
        previous.map(
          (item) =>
            item.id === task.id
              ? {
                  ...item,
                  status,
                }
              : item
        )
    );

    try {
      await updateTask(
        task.id,
        {
          status,
        }
      );
    } catch (err) {
      console.error(
        "Erreur statut tâche :",
        err
      );

      setTasks(
        (previous) =>
          previous.map(
            (item) =>
              item.id === task.id
                ? {
                    ...item,
                    status:
                      oldStatus,
                  }
                : item
          )
      );

      setError(
        "Impossible de modifier la tâche."
      );
    }
  }

  async function removeTask(
    taskId: string
  ) {
    if (!canEdit) {
      return;
    }

    const previousTasks =
      tasks;

    setTasks(
      (current) =>
        current.filter(
          (task) =>
            task.id !== taskId
        )
    );

    try {
      await deleteTask(
        taskId
      );
    } catch (err) {
      console.error(
        "Erreur suppression tâche :",
        err
      );

      setTasks(
        previousTasks
      );

      setError(
        "Impossible de supprimer la tâche."
      );
    }
  }

  return {
    selectedDate,

    tasksByStatus,

    loading,
    error,

    canCreate,
    canEdit,

    addTask,
    changeStatus,
    removeTask,
  };
}