import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useApp } from "../../app/AppContext";

import {
  createGroupChannel,
  getChannels,
  getMessageDepartments,
  getMessageHotelMembers,
  getMessages,
  sendMessage,
  subscribeToMessages,
  type ChannelVisibility,
  type MessageDepartment,
  type MessageHotelMember,
  type StaffChannel,
  type StaffMessage,
  type StaffMessageWithAuthor,
} from "../../services/messagesService";

import {
  createTask,
} from "../../services/tasksService";

/* =========================================================
   UTILS
   ========================================================= */

function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   HOOK
   ========================================================= */

export function useMessages() {
  const {
    hotelId,
    user,
    selectedDate,
  } = useApp();

  /* =======================================================
     CHANNELS
     ======================================================= */

  const [
    channels,
    setChannels,
  ] = useState<StaffChannel[]>([]);

  const [
    activeChannelId,
    setActiveChannelId,
  ] = useState<string | null>(null);

  const [
    loadingChannels,
    setLoadingChannels,
  ] = useState(true);

  /* =======================================================
     MESSAGES
     ======================================================= */

  const [
    messages,
    setMessages,
  ] = useState<
    StaffMessageWithAuthor[]
  >([]);

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  /* =======================================================
     DIRECTORY
     ======================================================= */

  const [
    members,
    setMembers,
  ] = useState<
    MessageHotelMember[]
  >([]);

  const [
    departments,
    setDepartments,
  ] = useState<
    MessageDepartment[]
  >([]);

  const [
    loadingDirectory,
    setLoadingDirectory,
  ] = useState(false);

  const [
    creatingGroup,
    setCreatingGroup,
  ] = useState(false);

  /* =======================================================
     TASKS
     ======================================================= */

  const [
    convertingMessageId,
    setConvertingMessageId,
  ] = useState<string | null>(
    null
  );

  const [
    convertedMessageIds,
    setConvertedMessageIds,
  ] = useState<string[]>([]);

  /* =======================================================
     ERROR
     ======================================================= */

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  /* =======================================================
     PERMISSIONS
     ======================================================= */

  const normalizedRole =
  String(user.role ?? "")
    .trim()
    .toLowerCase();

    const canManageChannels = [
    "owner",
    "admin",
    "manager",
    ].includes(normalizedRole);

  /* =======================================================
     ACTIVE CHANNEL
     ======================================================= */

  const activeChannel =
    useMemo(() => {
      return (
        channels.find(
          (channel) =>
            channel.id ===
            activeChannelId
        ) ?? null
      );
    }, [
      channels,
      activeChannelId,
    ]);

  /* =======================================================
     LOAD CHANNELS
     ======================================================= */

  const loadChannels =
    useCallback(async () => {
      if (!hotelId) {
        setChannels([]);
        setActiveChannelId(null);
        setLoadingChannels(false);

        return;
      }

      try {
        setLoadingChannels(true);
        setError(null);

        const rows =
          await getChannels(
            hotelId
          );

        setChannels(rows);

        setActiveChannelId(
          (current) => {
            if (
              current &&
              rows.some(
                (channel) =>
                  channel.id ===
                  current
              )
            ) {
              return current;
            }

            return (
              rows[0]?.id ?? null
            );
          }
        );
      } catch (err) {
        console.error(
          "Erreur chargement salons :",
          err
        );

        setError(
          "Impossible de charger les conversations."
        );
      } finally {
        setLoadingChannels(
          false
        );
      }
    }, [hotelId]);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  /* =======================================================
     LOAD DIRECTORY
     ======================================================= */

  useEffect(() => {
    if (
      !hotelId ||
      !canManageChannels
    ) {
      setMembers([]);
      setDepartments([]);
      setLoadingDirectory(false);

      return;
    }

    const currentHotelId =
      hotelId;

    let cancelled = false;

    async function loadDirectory() {
      try {
        setLoadingDirectory(
          true
        );

        const [
          membersData,
          departmentsData,
        ] = await Promise.all([
          getMessageHotelMembers(
            currentHotelId
          ),

          getMessageDepartments(
            currentHotelId
          ),
        ]);

        if (cancelled) {
          return;
        }

        setMembers(
          membersData
        );

        setDepartments(
          departmentsData
        );
      } catch (err) {
        console.error(
          "Erreur chargement annuaire messages :",
          err
        );

        if (!cancelled) {
          setError(
            "Impossible de charger les membres et départements."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDirectory(
            false
          );
        }
      }
    }

    void loadDirectory();

    return () => {
      cancelled = true;
    };
  }, [
    hotelId,
    canManageChannels,
  ]);

  /* =======================================================
     LOAD MESSAGES
     ======================================================= */

  const loadMessages =
    useCallback(async () => {
      if (
        !hotelId ||
        !activeChannelId
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
            activeChannelId
          );

        setMessages(rows);
      } catch (err) {
        console.error(
          "Erreur chargement messages :",
          err
        );

        setError(
          "Impossible de charger les messages."
        );
      } finally {
        setLoadingMessages(
          false
        );
      }
    }, [
      hotelId,
      activeChannelId,
    ]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  /* =======================================================
     REALTIME
     ======================================================= */

  useEffect(() => {
    if (
      !hotelId ||
      !activeChannelId
    ) {
      return;
    }

    const currentHotelId =
      hotelId;

    const currentChannelId =
      activeChannelId;

    const unsubscribe =
      subscribeToMessages(
        currentChannelId,
        async (
          message: StaffMessage
        ) => {
          setMessages(
            (previous) => {
              const exists =
                previous.some(
                  (item) =>
                    item.id ===
                    message.id
                );

              if (exists) {
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

          try {
            const rows =
              await getMessages(
                currentHotelId,
                currentChannelId
              );

            setMessages(rows);
          } catch (err) {
            console.error(
              "Erreur refresh realtime messages :",
              err
            );
          }
        }
      );

    return unsubscribe;
  }, [
    hotelId,
    activeChannelId,
  ]);

  /* =======================================================
     SEND MESSAGE
     ======================================================= */

  const sendMessageToChannel =
    useCallback(
      async (
        content: string
      ) => {
        const text =
          content.trim();

        if (
          !text ||
          !hotelId ||
          !activeChannelId
        ) {
          return;
        }

        try {
          setSending(true);
          setError(null);

          const created =
            await sendMessage({
              hotelId,

              channelId:
                activeChannelId,

              content: text,
            });

          const optimistic:
            StaffMessageWithAuthor =
            {
              ...created,

              author_name:
                `${user.firstName} ${user.lastName}`.trim() ||
                "Membre",

              author_department:
                user.departments?.[
                  0
                ] ?? null,
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

          setError(
            "Impossible d'envoyer le message."
          );

          throw err;
        } finally {
          setSending(false);
        }
      },
      [
        hotelId,
        activeChannelId,
        user.firstName,
        user.lastName,
        user.departments,
      ]
    );

  /* =======================================================
     CREATE GROUP
     ======================================================= */

  const createGroup =
    useCallback(
      async ({
        name,
        description,
        visibilityMode,
        memberUserIds,
        departmentIds,
      }: {
        name: string;

        description?: string;

        visibilityMode:
          ChannelVisibility;

        memberUserIds:
          string[];

        departmentIds:
          string[];
      }) => {
        if (
          !hotelId ||
          !canManageChannels
        ) {
          return;
        }

        const currentHotelId =
          hotelId;

        try {
          setCreatingGroup(
            true
          );

          setError(null);

          const channel =
            await createGroupChannel(
              {
                hotelId:
                  currentHotelId,

                name,

                description:
                  description ||
                  null,

                visibilityMode,

                memberUserIds,

                departmentIds,
              }
            );

          const rows =
            await getChannels(
              currentHotelId
            );

          setChannels(rows);

          setActiveChannelId(
            channel.id
          );

          return channel;
        } catch (err) {
          console.error(
            "Erreur création groupe :",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Impossible de créer le groupe."
          );

          throw err;
        } finally {
          setCreatingGroup(
            false
          );
        }
      },
      [
        hotelId,
        canManageChannels,
      ]
    );

  /* =======================================================
     MESSAGE -> TASK
     ======================================================= */

  const createTaskFromMessage =
    useCallback(
      async (
        message:
          StaffMessageWithAuthor
      ) => {
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
              message.content
                .length > 70
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
            (previous) => {
              if (
                previous.includes(
                  message.id
                )
              ) {
                return previous;
              }

              return [
                ...previous,
                message.id,
              ];
            }
          );
        } catch (err) {
          console.error(
            "Erreur conversion message en tâche :",
            err
          );

          setError(
            "Impossible de transformer ce message en tâche."
          );

          throw err;
        } finally {
          setConvertingMessageId(
            null
          );
        }
      },
      [
        hotelId,
        selectedDate,
      ]
    );

  /* =======================================================
     RETURN
     ======================================================= */

  return {
    user,

    channels,
    activeChannel,
    activeChannelId,
    setActiveChannelId,

    loadingChannels,
    reloadChannels:
      loadChannels,

    messages,
    loadingMessages,
    sending,

    sendMessage:
      sendMessageToChannel,

    reloadMessages:
      loadMessages,

    canManageChannels,

    members,
    departments,

    loadingDirectory,
    creatingGroup,

    createGroup,

    convertingMessageId,
    convertedMessageIds,

    createTaskFromMessage,

    error,
  };
}