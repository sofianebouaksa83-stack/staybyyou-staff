import { CheckSquare } from "lucide-react";
import type {
  StaffMessageWithAuthor,
} from "../../services/messagesService";

type Props = {
  message: StaffMessageWithAuthor;
  isMine: boolean;
  onCreateTask: (
    message: StaffMessageWithAuthor
  ) => void;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isMine,
  onCreateTask,
}: Props) {
  return (
    <div
      className={`message-row ${
        isMine ? "message-row-mine" : "message-row-other"
      }`}
    >
      <div className="message-bubble-wrap">
        {!isMine && (
          <div className="message-author">
            <strong>
              {message.author_name || "Membre"}
            </strong>

            {message.author_department && (
              <span>{message.author_department}</span>
            )}
          </div>
        )}

        <div
          className={`message-bubble ${
            isMine ? "message-bubble-mine" : "message-bubble-other"
          }`}
        >
          <p>{message.content}</p>
        </div>

        <div className="message-meta">
          <span>{formatTime(message.created_at)}</span>

          <button
            type="button"
            className="message-task-action"
            onClick={() => onCreateTask(message)}
            title="Créer une tâche"
          >
            <CheckSquare size={12} />
            Tâche
          </button>
        </div>
      </div>
    </div>
  );
}