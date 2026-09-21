import {
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import type {
  ChannelVisibility,
  MessageDepartment,
  MessageHotelMember,
} from "../../services/messagesService";


type ChannelKind =
  | "team"
  | "group";


type Props = {
  open: boolean;

  members:
    MessageHotelMember[];

  departments:
    MessageDepartment[];

  creating:
    boolean;

  onClose:
    () => void;

  onCreate: (
    payload: {
      name: string;

      description?:
        string;

      channelType:
        ChannelKind;

      visibilityMode:
        ChannelVisibility;

      memberUserIds:
        string[];

      departmentIds:
        string[];
    }
  ) => Promise<unknown>;
};


export function CreateChannelModal({
  open,
  members,
  departments,
  creating,
  onClose,
  onCreate,
}: Props) {
  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    channelType,
    setChannelType,
  ] =
    useState<ChannelKind>(
      "team"
    );

  const [
    visibilityMode,
    setVisibilityMode,
  ] =
    useState<ChannelVisibility>(
      "hotel"
    );

  const [
    memberUserIds,
    setMemberUserIds,
  ] =
    useState<string[]>(
      []
    );

  const [
    departmentIds,
    setDepartmentIds,
  ] =
    useState<string[]>(
      []
    );


  const canSubmit =
    useMemo(() => {
      if (!name.trim()) {
        return false;
      }

      if (
        visibilityMode ===
          "members" &&
        memberUserIds.length ===
          0
      ) {
        return false;
      }

      if (
        visibilityMode ===
          "departments" &&
        departmentIds.length ===
          0
      ) {
        return false;
      }

      return true;
    }, [
      name,
      visibilityMode,
      memberUserIds,
      departmentIds,
    ]);


  if (!open) {
    return null;
  }


  function reset() {
    setName("");
    setDescription("");

    setChannelType(
      "team"
    );

    setVisibilityMode(
      "hotel"
    );

    setMemberUserIds(
      []
    );

    setDepartmentIds(
      []
    );
  }


  function close() {
    if (creating) {
      return;
    }

    reset();
    onClose();
  }


  function toggleMember(
    userId:
      string
  ) {
    setMemberUserIds(
      (
        previous
      ) => {
        if (
          previous.includes(
            userId
          )
        ) {
          return previous.filter(
            (
              id
            ) =>
              id !==
              userId
          );
        }

        return [
          ...previous,
          userId,
        ];
      }
    );
  }


  function toggleDepartment(
    departmentId:
      string
  ) {
    setDepartmentIds(
      (
        previous
      ) => {
        if (
          previous.includes(
            departmentId
          )
        ) {
          return previous.filter(
            (
              id
            ) =>
              id !==
              departmentId
          );
        }

        return [
          ...previous,
          departmentId,
        ];
      }
    );
  }


  async function handleSubmit() {
    if (
      !canSubmit ||
      creating
    ) {
      return;
    }

    await onCreate({
      name:
        name.trim(),

      description:
        description.trim() ||
        undefined,

      channelType,

      visibilityMode,

      memberUserIds,

      departmentIds,
    });

    reset();
    onClose();
  }


  return (
    <div
      className="message-modal-backdrop"

      onMouseDown={
        close
      }
    >
      <div
        className="message-modal"

        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="message-modal-header">
          <div>
            <h2>
              Nouvelle conversation
            </h2>

            <p>
              Crée un salon d’équipe
              ou un groupe dédié.
            </p>
          </div>

          <button
            type="button"
            className="message-modal-close"

            onClick={
              close
            }

            disabled={
              creating
            }

            aria-label="Fermer"
          >
            <X
              size={20}
            />
          </button>
        </div>


        <div className="message-modal-body">
          <div className="message-field">
            <span>
              Type
            </span>

            <div className="message-visibility-options">
              <button
                type="button"

                className={
                  channelType ===
                  "team"
                    ? "active"
                    : undefined
                }

                onClick={() =>
                  setChannelType(
                    "team"
                  )
                }
              >
                <strong>
                  Salon équipe
                </strong>

                <small>
                  Pour les échanges
                  réguliers d’un service.
                </small>
              </button>


              <button
                type="button"

                className={
                  channelType ===
                  "group"
                    ? "active"
                    : undefined
                }

                onClick={() =>
                  setChannelType(
                    "group"
                  )
                }
              >
                <strong>
                  Groupe
                </strong>

                <small>
                  Pour une conversation
                  ponctuelle ou ciblée.
                </small>
              </button>
            </div>
          </div>


          <label className="message-field">
            <span>
              Nom
            </span>

            <input
              value={
                name
              }

              onChange={(
                event
              ) =>
                setName(
                  event.target.value
                )
              }

              placeholder={
                channelType ===
                "team"
                  ? "Ex. Housekeeping"
                  : "Ex. Séminaire 18 septembre"
              }

              maxLength={
                80
              }

              autoFocus
            />
          </label>


          <label className="message-field">
            <span>
              Description

              <small>
                Facultatif
              </small>
            </span>

            <textarea
              value={
                description
              }

              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }

              placeholder="À quoi sert cette conversation ?"

              rows={
                3
              }

              maxLength={
                240
              }
            />
          </label>


          <div className="message-field">
            <span>
              Visibilité
            </span>

            <div className="message-visibility-options">
              <button
                type="button"

                className={
                  visibilityMode ===
                  "hotel"
                    ? "active"
                    : undefined
                }

                onClick={() => {
                  setVisibilityMode(
                    "hotel"
                  );

                  setMemberUserIds(
                    []
                  );

                  setDepartmentIds(
                    []
                  );
                }}
              >
                <strong>
                  Tout l’hôtel
                </strong>

                <small>
                  Tous les membres
                  actifs peuvent voir
                  la conversation.
                </small>
              </button>


              <button
                type="button"

                className={
                  visibilityMode ===
                  "departments"
                    ? "active"
                    : undefined
                }

                onClick={() => {
                  setVisibilityMode(
                    "departments"
                  );

                  setMemberUserIds(
                    []
                  );
                }}
              >
                <strong>
                  Départements
                </strong>

                <small>
                  Visible uniquement
                  par certains services.
                </small>
              </button>


              <button
                type="button"

                className={
                  visibilityMode ===
                  "members"
                    ? "active"
                    : undefined
                }

                onClick={() => {
                  setVisibilityMode(
                    "members"
                  );

                  setDepartmentIds(
                    []
                  );
                }}
              >
                <strong>
                  Utilisateurs
                </strong>

                <small>
                  Choisis les personnes
                  autorisées.
                </small>
              </button>
            </div>
          </div>


          {visibilityMode ===
            "departments" && (
            <div className="message-access-picker">
              <div className="message-access-picker-title">
                Départements autorisés
              </div>

              <div className="message-access-list">
                {departments.map(
                  (
                    department
                  ) => {
                    const selected =
                      departmentIds.includes(
                        department.id
                      );

                    return (
                      <button
                        type="button"

                        key={
                          department.id
                        }

                        className={
                          selected
                            ? "selected"
                            : undefined
                        }

                        onClick={() =>
                          toggleDepartment(
                            department.id
                          )
                        }
                      >
                        <span>
                          {
                            department.name
                          }
                        </span>

                        <input
                          type="checkbox"

                          checked={
                            selected
                          }

                          readOnly
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}


          {visibilityMode ===
            "members" && (
            <div className="message-access-picker">
              <div className="message-access-picker-title">
                Utilisateurs autorisés
              </div>

              <div className="message-access-list">
                {members.map(
                  (
                    member
                  ) => {
                    const selected =
                      memberUserIds.includes(
                        member.user_id
                      );

                    return (
                      <button
                        type="button"

                        key={
                          member.id
                        }

                        className={
                          selected
                            ? "selected"
                            : undefined
                        }

                        onClick={() =>
                          toggleMember(
                            member.user_id
                          )
                        }
                      >
                        <span>
                          <strong>
                            {
                              member.display_name
                            }
                          </strong>

                          <small>
                            {
                              member.role
                            }
                          </small>
                        </span>

                        <input
                          type="checkbox"

                          checked={
                            selected
                          }

                          readOnly
                        />
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>


        <div className="message-modal-footer">
          <button
            type="button"
            className="message-modal-secondary"

            onClick={
              close
            }

            disabled={
              creating
            }
          >
            Annuler
          </button>

          <button
            type="button"
            className="message-modal-primary"

            disabled={
              !canSubmit ||
              creating
            }

            onClick={() =>
              void handleSubmit()
            }
          >
            {creating
              ? "Création…"
              : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}