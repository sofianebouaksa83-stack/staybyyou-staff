import {
  CheckCircle2,
  Clock3,
  Trash2,
} from "lucide-react";

import type {
  GuestFollowup,
} from "../../services/hotelService";


type Props = {
  followup:
    GuestFollowup;

  canManage:
    boolean;

  onUpdate:
    () => void;

  onDelete:
    () => void;
};


function typeLabel(
  type:
    GuestFollowup["followup_type"]
) {
  switch (type) {
    case "request":
      return "Demande";

    case "complaint":
      return "Plainte";

    case "incident":
      return "Incident";

    case "preference":
      return "Préférence";

    case "vip":
      return "VIP";

    default:
      return "Note";
  }
}


function statusLabel(
  status:
    GuestFollowup["status"]
) {
  switch (status) {
    case "in_progress":
      return "En cours";

    case "resolved":
      return "Résolu";

    default:
      return "Ouvert";
  }
}


function formatDate(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day:
        "2-digit",

      month:
        "short",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    new Date(
      value
    )
  );
}


export function FollowupCard({
  followup,
  canManage,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <article className="followup-card">
      <div className="followup-card-top">
        <div className="followup-card-tags">
          <span
            className={
              `followup-type ${followup.followup_type}`
            }
          >
            {typeLabel(
              followup.followup_type
            )}
          </span>


          <span
            className={
              `followup-priority ${followup.priority}`
            }
          >
            {followup.priority ===
            "urgent"
              ? "Urgent"
              : followup.priority ===
                "high"
              ? "Haute"
              : "Normal"}
          </span>
        </div>


        <span
          className={
            `followup-status ${followup.status}`
          }
        >
          {followup.status ===
          "resolved" ? (
            <CheckCircle2
              size={12}
            />
          ) : (
            <Clock3
              size={12}
            />
          )}


          {statusLabel(
            followup.status
          )}
        </span>
      </div>


      <p className="followup-content">
        {followup.content}
      </p>


      <footer className="followup-card-footer">
        <small>
          {formatDate(
            followup.created_at
          )}
        </small>


        {canManage && (
          <div className="followup-card-actions">
            <button
              type="button"
              className="followup-action-button"

              onClick={
                onUpdate
              }
            >
              Modifier
            </button>


            <button
              type="button"
              className="followup-icon-button danger"

              onClick={
                onDelete
              }

              title="Supprimer"
            >
              <Trash2
                size={14}
              />
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}