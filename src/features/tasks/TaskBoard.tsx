import { Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "../../components/ui/PageHeader";

import {
  taskColumns,
  useTasks,
} from "./useTasks";

import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";

export function TaskBoard() {
  const {
    selectedDate,
    tasksByStatus,
    loading,
    error,
    canCreate,
    canEdit,
    canDelete,
    addTask,
    changeStatus,
    removeTask,
  } = useTasks();

  const [showModal, setShowModal] =
    useState(false);

  async function handleDelete(
    taskId: string
  ) {
    if (!canDelete) {
      return;
    }

    const confirmed =
      window.confirm(
        "Supprimer cette tâche ?"
      );

    if (!confirmed) {
      return;
    }

    await removeTask(taskId);
  }

  return (
    <>
      <PageHeader
        title="Tâches"
        subtitle="Suivez ce qui doit être fait, par qui et avant quand."
        action={
          canCreate ? (
            <button
              type="button"
              className="primary-button small-button"
              onClick={() =>
                setShowModal(true)
              }
            >
              <Plus size={16} />
              Nouvelle tâche
            </button>
          ) : undefined
        }
      />

      {error && (
        <div
          style={{
            marginBottom: 16,
            color: "#a84d46",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            padding: "30px 0",
            opacity: 0.65,
          }}
        >
          Chargement des tâches…
        </div>
      ) : (
        <div className="kanban">
          {taskColumns.map(
            (column) => {
              const columnTasks =
                tasksByStatus.get(
                  column.status
                ) ?? [];

              return (
                <section
                  className="kanban-col"
                  key={column.status}
                >
                  <div className="kanban-title">
                    <strong>
                      {column.label}
                    </strong>

                    <span>
                      {columnTasks.length}
                    </span>
                  </div>

                  {columnTasks.length ===
                    0 && (
                    <div
                      style={{
                        padding:
                          "18px 4px",
                        opacity: 0.55,
                        fontSize: 12,
                      }}
                    >
                      Aucune tâche
                    </div>
                  )}

                  {columnTasks.map(
                    (task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onStatusChange={
                          changeStatus
                        }
                        onDelete={
                          handleDelete
                        }
                      />
                    )
                  )}
                </section>
              );
            }
          )}
        </div>
      )}

      <TaskModal
        open={showModal}
        selectedDate={selectedDate}
        onClose={() =>
          setShowModal(false)
        }
        onSubmit={addTask}
      />
    </>
  );
}