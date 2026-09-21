import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  getChannelAccess,
  type ChannelVisibility,
  type MessageDepartment,
  type MessageHotelMember,
  type StaffChannel,
} from "../../services/messagesService";


type Props = {
  open: boolean;

  channel:
    StaffChannel | null;

  members:
    MessageHotelMember[];

  departments:
    MessageDepartment[];

  saving: boolean;

  onClose:
    () => void;

  onSave: (
    payload: {
      channelId: string;

      name: string;

      description?:
        string;

      visibilityMode:
        ChannelVisibility;

      memberUserIds:
        string[];

      departmentIds:
        string[];
    }
  ) => Promise<unknown>;
};


export function EditChannelModal({
  open,
  channel,
  members,
  departments,
  saving,
  onClose,
  onSave,
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

  const [
    loadingAccess,
    setLoadingAccess,
  ] = useState(false);

  const [
    localError,
    setLocalError,
  ] =
    useState<
      string | null
    >(null);


  useEffect(() => {
    if (
      !open ||
      !channel
    ) {
      return;
    }

    /*
     * On garde une référence non-null.
     * TypeScript peut alors l'utiliser
     * correctement dans la fonction async.
     */
    const currentChannel =
      channel;

    let cancelled =
      false;


    async function load() {
      setName(
        currentChannel.name
      );

      setDescription(
        currentChannel.description ??
          ""
      );

      setVisibilityMode(
        currentChannel.visibility_mode
      );

      setMemberUserIds(
        []
      );

      setDepartmentIds(
        []
      );

      setLocalError(
        null
      );


      try {
        setLoadingAccess(
          true
        );

        const access =
          await getChannelAccess(
            currentChannel.id
          );

        if (
          cancelled
        ) {
          return;
        }

        setMemberUserIds(
          access.memberUserIds
        );

        setDepartmentIds(
          access.departmentIds
        );
      } catch (
        error
      ) {
        console.error(
          "Erreur chargement accès groupe :",
          error
        );

        if (
          !cancelled
        ) {
          setLocalError(
            "Impossible de charger les accès du groupe."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoadingAccess(
            false
          );
        }
      }
    }


    void load();


    return () => {
      cancelled =
        true;
    };
  }, [
    open,
    channel,
  ]);


  const canSubmit =
    useMemo(() => {
      if (
        !channel ||
        !name.trim()
      ) {
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
      channel,
      name,
      visibilityMode,
      memberUserIds,
      departmentIds,
    ]);


  if (
    !open ||
    !channel
  ) {
    return null;
  }


  /*
   * Même principe ici :
   * les fonctions ci-dessous utilisent
   * des valeurs non-null stables.
   */
  const currentChannelId =
    channel.id;


  function close() {
    if (
      saving
    ) {
      return;
    }

    setLocalError(
      null
    );

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
      saving ||
      loadingAccess
    ) {
      return;
    }

    try {
      setLocalError(
        null
      );

      await onSave({
        channelId:
          currentChannelId,

        name:
          name.trim(),

        description:
          description.trim() ||
          undefined,

        visibilityMode,

        memberUserIds,

        departmentIds,
      });

      onClose();
    } catch (
      error
    ) {
      console.error(
        "Erreur modification groupe :",
        error
      );

      setLocalError(
        error instanceof
          Error
          ? error.message
          : "Impossible de modifier le groupe."
      );
    }
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
             {channel.channel_type === "group"
              ? "Modifier le groupe"
              : "Modifier le salon"}
            </h2>

            <p>
              Modifie le nom, la description et les accès à cette conversation.
            </p>
          </div>

          <button
            type="button"
            className="message-modal-close"
            onClick={
              close
            }
            disabled={
              saving
            }
            aria-label="Fermer"
          >
            <X
              size={20}
            />
          </button>
        </div>


        <div className="message-modal-body">
          {localError && (
            <div className="message-modal-error">
              {localError}
            </div>
          )}


          <label className="message-field">
            <span>
              {channel.channel_type === "group"
                ? "Nom du groupe"
                : "Nom du salon"}
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
              maxLength={
                80
              }
              disabled={
                loadingAccess ||
                saving
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
              rows={
                3
              }
              maxLength={
                240
              }
              disabled={
                loadingAccess ||
                saving
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
                  le groupe.
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


          {loadingAccess ? (
            <div className="channels-empty">
              Chargement des accès…
            </div>
          ) : (
            <>
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
            </>
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
              saving
            }
          >
            Annuler
          </button>

          <button
            type="button"
            className="message-modal-primary"
            disabled={
              !canSubmit ||
              saving ||
              loadingAccess
            }
            onClick={() =>
              void handleSubmit()
            }
          >
            {saving
              ? "Enregistrement…"
              : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}