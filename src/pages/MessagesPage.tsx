import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  MoreHorizontal,
  Paperclip,
  Send,
} from "lucide-react";

import { PageHeader } from "../components/ui/PageHeader";
import { useApp } from "../app/AppContext";

import {
  getChannels,
  getMessages,
  sendMessage,
  subscribeToMessages,
  type StaffChannel,
  type StaffMessage,
  type StaffMessageWithAuthor,
} from "../services/messagesService";

import {
  createTask,
} from "../services/tasksService";

function formatMessageTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function roleLabel(
  role: string | null
) {
  switch (role) {
    case "owner":
      return "Propriétaire";

    case "admin":
      return "Admin";

    case "manager":
      return "Responsable";

    case "reception":
      return "Réception";

    case "kitchen":
      return "Cuisine";

    case "delivery":
      return "Livraison";

    case "bedroom":
      return "Étages";

    case "read_only":
      return "Lecture seule";

    default:
      return "Équipe";
  }
}

function formatDateKey(
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

export default function MessagesPage() {
  const {
    hotelId,
    user,
    selectedDate,
  } = useApp();

  const [
    channels,
    setChannels,
  ] = useState<
    StaffChannel[]
  >([]);

  const [
    channelId,
    setChannelId,
  ] = useState<
    string | null
  >(null);

  const [
    messages,
    setMessages,
  ] = useState<
    StaffMessageWithAuthor[]
  >([]);

  const [
    draft,
    setDraft,
  ] = useState("");

  const [
    loadingChannels,
    setLoadingChannels,
  ] = useState(true);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    convertingMessageId,
    setConvertingMessageId,
  ] = useState<
    string | null
  >(null);

  const [
    convertedMessageIds,
    setConvertedMessageIds,
  ] = useState<
    string[]
  >([]);

  const currentChannel =
    useMemo(
      () =>
        channels.find(
          (item) =>
            item.id ===
            channelId
        ) ?? null,
      [
        channels,
        channelId,
      ]
    );

  useEffect(() => {
    let cancelled = false;

    async function loadChannels() {
      if (!hotelId) {
        setChannels([]);
        setChannelId(null);
        setLoadingChannels(
          false
        );

        return;
      }

      try {
        setLoadingChannels(
          true
        );

        setError(null);

        const rows =
          await getChannels(
            hotelId
          );

        if (cancelled) {
          return;
        }

        setChannels(rows);

        setChannelId(
          (current) =>
            current ??
            rows[0]?.id ??
            null
        );
      } catch (err) {
        console.error(
          "Erreur canaux :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger les conversations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingChannels(
            false
          );
        }
      }
    }

    loadChannels();

    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (
        !hotelId ||
        !channelId
      ) {
        setMessages([]);

        return;
      }

      try {
        setLoadingMessages(
          true
        );

        setError(null);

        const rows =
          await getMessages(
            hotelId,
            channelId
          );

        if (cancelled) {
          return;
        }

        setMessages(rows);
      } catch (err) {
        console.error(
          "Erreur messages :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger les messages."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(
            false
          );
        }
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    channelId,
  ]);

  /**
   * REALTIME
   */
  useEffect(() => {
    if (
      !channelId ||
      !hotelId
    ) {
      return;
    }

    const unsubscribe =
      subscribeToMessages(
        channelId,
        async (
          message: StaffMessage
        ) => {
          /**
           * Evite les doublons
           * si le message vient de nous.
           */
          setMessages(
            (previous) => {
              if (
                previous.some(
                  (item) =>
                    item.id ===
                    message.id
                )
              ) {
                return previous;
              }

              return [
                ...previous,
                {
                  ...message,
                  author_name:
                    "Membre",
                  author_department:
                    null,
                },
              ];
            }
          );

          /**
           * Recharge pour récupérer
           * display_name + rôle.
           */
          try {
            const rows =
              await getMessages(
                hotelId,
                channelId
              );

            setMessages(rows);
          } catch (err) {
            console.error(
              "Erreur refresh realtime :",
              err
            );
          }
        }
      );

    return unsubscribe;
  }, [
    channelId,
    hotelId,
  ]);

  async function handleSend() {
    const text =
      draft.trim();

    if (
      !text ||
      !hotelId ||
      !channelId
    ) {
      return;
    }

    try {
      setDraft("");
      setError(null);

      const created =
        await sendMessage({
          hotelId,
          channelId,
          content:
            text,
        });

      const optimistic:
        StaffMessageWithAuthor =
        {
          ...created,

          author_name:
            `${user.firstName} ${user.lastName}`.trim(),

          author_department:
            user.departments?.[0] ??
            null,
        };

      setMessages(
        (previous) => {
          if (
            previous.some(
              (item) =>
                item.id ===
                created.id
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            optimistic,
          ];
        }
      );
    } catch (err) {
      console.error(
        "Erreur envoi message :",
        err
      );

      setDraft(text);

      setError(
        "Impossible d'envoyer le message."
      );
    }
  }

  async function handleConvertToTask(
    message: StaffMessageWithAuthor
  ) {
    if (!hotelId) {
      return;
    }

    try {
      setConvertingMessageId(
        message.id
      );

      setError(null);

      const date =
        formatDateKey(
          selectedDate
        );

      const dueAt =
        new Date(
          `${date}T18:00:00`
        ).toISOString();

      await createTask({
        hotelId,

        title:
          message.content.length >
          70
            ? `${message.content.slice(
                0,
                67
              )}...`
            : message.content,

        description:
          `Créée depuis un message de ${message.author_name}`,

        dueAt,

        priority:
          "normal",
      });

      setConvertedMessageIds(
        (previous) => [
          ...previous,
          message.id,
        ]
      );
    } catch (err) {
      console.error(
        "Erreur conversion en tâche :",
        err
      );

      setError(
        "Impossible de transformer ce message en tâche."
      );
    } finally {
      setConvertingMessageId(
        null
      );
    }
  }

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Une communication interne simple, proche des usages d’une messagerie moderne."
      />

      {error && (
        <div
          style={{
            marginBottom: 14,
            color: "#a84d46",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <div className="messaging">
        <aside className="channels">
          <strong>
            Conversations
          </strong>

          {loadingChannels ? (
            <p
              style={{
                opacity: 0.6,
                fontSize: 12,
              }}
            >
              Chargement…
            </p>
          ) : (
            channels.map(
              (item) => (
                <button
                  key={
                    item.id
                  }
                  className={
                    channelId ===
                    item.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setChannelId(
                      item.id
                    )
                  }
                >
                  <span>
                    #{" "}
                    {
                      item.name
                    }
                  </span>
                </button>
              )
            )
          )}
        </aside>

        <section className="chat">
          <div className="chat-head">
            <div>
              <strong>
                #{" "}
                {currentChannel?.name ??
                  "Conversation"}
              </strong>

              <small>
                Communication
                d’équipe
              </small>
            </div>

            <button className="ghost-icon">
              <MoreHorizontal
                size={18}
              />
            </button>
          </div>

          <div className="chat-body">
            {loadingMessages ? (
              <div className="empty-chat">
                <p>
                  Chargement des
                  messages…
                </p>
              </div>
            ) : (
              <>
                {messages.map(
                  (
                    message
                  ) => {
                    const converted =
                      convertedMessageIds.includes(
                        message.id
                      );

                    return (
                      <div
                        className="bubble-wrap"
                        key={
                          message.id
                        }
                      >
                        <div className="avatar small">
                          {message
                            .author_name?.[0]
                            ?.toUpperCase() ??
                            "?"}
                        </div>

                        <div>
                          <div className="bubble-meta">
                            <strong>
                              {
                                message.author_name
                              }
                            </strong>

                            <span>
                              {roleLabel(
                                message.author_department
                              )}
                            </span>

                            <small>
                              {formatMessageTime(
                                message.created_at
                              )}
                            </small>
                          </div>

                          <div className="bubble">
                            {
                              message.content
                            }
                          </div>

                          <button
                            className="message-action"
                            disabled={
                              converted ||
                              convertingMessageId ===
                                message.id
                            }
                            onClick={() =>
                              handleConvertToTask(
                                message
                              )
                            }
                          >
                            {converted ? (
                              <>
                                <Check
                                  size={
                                    13
                                  }
                                />
                                Tâche créée
                              </>
                            ) : convertingMessageId ===
                              message.id ? (
                              "Création…"
                            ) : (
                              "Transformer en tâche"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}

                {messages.length ===
                  0 && (
                  <div className="empty-chat">
                    <p>
                      Aucun message
                      dans cette
                      conversation.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="composer">
            <button className="ghost-icon">
              <Paperclip
                size={18}
              />
            </button>

            <input
              value={
                draft
              }
              onChange={(
                event
              ) =>
                setDraft(
                  event
                    .target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  handleSend();
                }
              }}
              placeholder={
                currentChannel
                  ? `Écrire dans #${currentChannel.name}…`
                  : "Sélectionnez une conversation"
              }
              disabled={
                !channelId
              }
            />

            <button
              className="send-button"
              onClick={
                handleSend
              }
              disabled={
                !draft.trim() ||
                !channelId
              }
            >
              <Send
                size={18}
              />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}