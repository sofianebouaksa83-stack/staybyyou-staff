import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useApp,
} from "../../app/AppContext";

import {
  archiveChannel,
  createChannel,
  updateChannel,
  deleteChannel,
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

import {
  useHotelPermission,
} from "../permissions/hooks/useHotelPermission";


function formatDateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


export function useMessages() {
  const {
    hotelId,
    user,
    selectedDate,
  } = useApp();


  const [
    channels,
    setChannels,
  ] =
    useState<StaffChannel[]>(
      []
    );

  const [
    activeChannelId,
    setActiveChannelId,
  ] =
    useState<
      string | null
    >(null);

  const [
    loadingChannels,
    setLoadingChannels,
  ] = useState(true);


  const [
    messages,
    setMessages,
  ] =
    useState<
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


  const [
    members,
    setMembers,
  ] =
    useState<
      MessageHotelMember[]
    >([]);

  const [
    departments,
    setDepartments,
  ] =
    useState<
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

  const [
    managingChannelId,
    setManagingChannelId,
  ] =
    useState<
      string | null
    >(null);


  const [
    convertingMessageId,
    setConvertingMessageId,
  ] =
    useState<
      string | null
    >(null);

  const [
    convertedMessageIds,
    setConvertedMessageIds,
  ] =
    useState<string[]>(
      []
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  const {
    allowed:
      canManageChannels,
  } = useHotelPermission(
    hotelId,
    "messages.manage_channels"
  );

  const {
    allowed:
      canSendMessages,
  } = useHotelPermission(
    hotelId,
    "messages.send"
  );

  const {
    allowed:
      canCreateTasks,
  } = useHotelPermission(
    hotelId,
    "tasks.create"
  );


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


  const loadChannels =
    useCallback(
      async () => {
        if (!hotelId) {
          setChannels(
            []
          );

          setActiveChannelId(
            null
          );

          setLoadingChannels(
            false
          );

          return;
        }

        try {
          setLoadingChannels(
            true
          );

          setError(
            null
          );

          const rows =
            await getChannels(
              hotelId
            );

          setChannels(
            rows
          );

          setActiveChannelId(
            (
              current
            ) => {
              if (
                current &&
                rows.some(
                  (
                    channel
                  ) =>
                    channel.id ===
                    current
                )
              ) {
                return current;
              }

              return (
                rows[0]?.id ??
                null
              );
            }
          );
        } catch (
          err
        ) {
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
      },
      [
        hotelId,
      ]
    );


  useEffect(
    () => {
      void loadChannels();
    },
    [
      loadChannels,
    ]
  );


  useEffect(() => {
    if (
      !hotelId ||
      !canManageChannels
    ) {
      setMembers(
        []
      );

      setDepartments(
        []
      );

      setLoadingDirectory(
        false
      );

      return;
    }

    const currentHotelId =
      hotelId;

    let cancelled =
      false;


    async function loadDirectory() {
      try {
        setLoadingDirectory(
          true
        );

        const [
          membersData,
          departmentsData,
        ] =
          await Promise.all(
            [
              getMessageHotelMembers(
                currentHotelId
              ),

              getMessageDepartments(
                currentHotelId
              ),
            ]
          );

        if (
          cancelled
        ) {
          return;
        }

        setMembers(
          membersData
        );

        setDepartments(
          departmentsData
        );
      } catch (
        err
      ) {
        console.error(
          "Erreur chargement annuaire messages :",
          err
        );

        if (
          !cancelled
        ) {
          setError(
            "Impossible de charger les membres et départements."
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoadingDirectory(
            false
          );
        }
      }
    }


    void loadDirectory();


    return () => {
      cancelled =
        true;
    };
  }, [
    hotelId,
    canManageChannels,
  ]);


  const loadMessages =
    useCallback(
      async () => {
        if (
          !hotelId ||
          !activeChannelId
        ) {
          setMessages(
            []
          );

          return;
        }

        try {
          setLoadingMessages(
            true
          );

          setError(
            null
          );

          const rows =
            await getMessages(
              hotelId,
              activeChannelId
            );

          setMessages(
            rows
          );
        } catch (
          err
        ) {
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
      },
      [
        hotelId,
        activeChannelId,
      ]
    );


  useEffect(
    () => {
      void loadMessages();
    },
    [
      loadMessages,
    ]
  );


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
          message:
            StaffMessage
        ) => {
          setMessages(
            (
              previous
            ) => {
              const exists =
                previous.some(
                  (
                    item
                  ) =>
                    item.id ===
                    message.id
                );

              if (
                exists
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


          try {
            const rows =
              await getMessages(
                currentHotelId,
                currentChannelId
              );

            setMessages(
              rows
            );
          } catch (
            err
          ) {
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


  const sendMessageToChannel =
    useCallback(
      async (
        content:
          string
      ) => {
        const text =
          content.trim();

        if (
          !text ||
          !hotelId ||
          !activeChannelId ||
          !canSendMessages
        ) {
          return;
        }


        try {
          setSending(
            true
          );

          setError(
            null
          );


          const created =
            await sendMessage(
              {
                hotelId,

                channelId:
                  activeChannelId,

                content:
                  text,
              }
            );


          const optimistic:
            StaffMessageWithAuthor =
            {
              ...created,

              author_name:
                `${user.firstName} ${user.lastName}`.trim() ||
                "Membre",

              author_department:
                user
                  .departments?.[
                    0
                  ] ??
                null,
            };


          setMessages(
            (
              previous
            ) => {
              if (
                previous.some(
                  (
                    item
                  ) =>
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
        } catch (
          err
        ) {
          console.error(
            "Erreur envoi message :",
            err
          );

          setError(
            "Impossible d'envoyer le message."
          );

          throw err;
        } finally {
          setSending(
            false
          );
        }
      },
      [
        hotelId,
        activeChannelId,
        user.firstName,
        user.lastName,
        user.departments,
        canSendMessages,
      ]
    );


const createConversation =
  useCallback(
    async ({
      name,
      description,
      channelType,
      visibilityMode,
      memberUserIds,
      departmentIds,
    }: {
      name:
        string;

      description?:
        string;

      channelType:
        "team" |
        "group";

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

      try {
        setCreatingGroup(
          true
        );

        setError(
          null
        );

        const channel =
          await createChannel({
            hotelId,

            name,

            description:
              description ||
              null,

            channelType,

            visibilityMode,

            memberUserIds,

            departmentIds,
          });

        const rows =
          await getChannels(
            hotelId
          );

        setChannels(
          rows
        );

        setActiveChannelId(
          channel.id
        );

        return channel;
      } catch (
        err
      ) {
        console.error(
          "Erreur création salon :",
          err
        );

        setError(
          err instanceof
            Error
            ? err.message
            : "Impossible de créer le salon."
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


const updateConversation =
  useCallback(
    async ({
      channelId,
      name,
      description,
      visibilityMode,
      memberUserIds,
      departmentIds,
    }: {
      channelId:
        string;

      name:
        string;

      description?:
        string;

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

      try {
        setManagingChannelId(
          channelId
        );

        setError(
          null
        );

        const updated =
          await updateChannel({
            channelId,

            name,

            description:
              description ||
              null,

            visibilityMode,

            memberUserIds,

            departmentIds,
          });

        const rows =
          await getChannels(
            hotelId
          );

        setChannels(
          rows
        );

        return updated;
      } catch (
        err
      ) {
        console.error(
          "Erreur modification salon :",
          err
        );

        setError(
          err instanceof
            Error
            ? err.message
            : "Impossible de modifier le salon."
        );

        throw err;
      } finally {
        setManagingChannelId(
          null
        );
      }
    },
    [
      hotelId,
      canManageChannels,
    ]
  );


const archiveConversation =
  useCallback(
    async (
      channelId:
        string
    ) => {
      if (
        !hotelId ||
        !canManageChannels
      ) {
        return;
      }

      const channel =
        channels.find(
          (
            item
          ) =>
            item.id ===
            channelId
        );

      if (
        channel?.is_system
      ) {
        throw new Error(
          "Le salon Général ne peut pas être archivé."
        );
      }

      try {
        setManagingChannelId(
          channelId
        );

        setError(
          null
        );

        await archiveChannel(
          channelId
        );

        const rows =
          await getChannels(
            hotelId
          );

        setChannels(
          rows
        );

        if (
          activeChannelId ===
          channelId
        ) {
          setActiveChannelId(
            rows[0]?.id ??
              null
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Erreur archivage salon :",
          err
        );

        setError(
          err instanceof
            Error
            ? err.message
            : "Impossible d'archiver le salon."
        );

        throw err;
      } finally {
        setManagingChannelId(
          null
        );
      }
    },
    [
      hotelId,
      canManageChannels,
      activeChannelId,
      channels,
    ]
  );


const deleteConversation =
  useCallback(
    async (
      channelId:
        string
    ) => {
      if (
        !hotelId ||
        !canManageChannels
      ) {
        return;
      }

      const channel =
        channels.find(
          (
            item
          ) =>
            item.id ===
            channelId
        );

      if (
        channel?.is_system
      ) {
        throw new Error(
          "Le salon Général ne peut pas être supprimé."
        );
      }

      try {
        setManagingChannelId(
          channelId
        );

        setError(
          null
        );

        await deleteChannel(
          channelId
        );

        const rows =
          await getChannels(
            hotelId
          );

        setChannels(
          rows
        );

        if (
          activeChannelId ===
          channelId
        ) {
          setActiveChannelId(
            rows[0]?.id ??
              null
          );
        }
      } catch (
        err
      ) {
        console.error(
          "Erreur suppression salon :",
          err
        );

        setError(
          err instanceof
            Error
            ? err.message
            : "Impossible de supprimer le salon."
        );

        throw err;
      } finally {
        setManagingChannelId(
          null
        );
      }
    },
    [
      hotelId,
      canManageChannels,
      activeChannelId,
      channels,
    ]
  );


  const createTaskFromMessage =
    useCallback(
      async (
        message:
          StaffMessageWithAuthor
      ) => {
        if (
          !hotelId ||
          !canCreateTasks
        ) {
          return;
        }


        try {
          setConvertingMessageId(
            message.id
          );

          setError(
            null
          );


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
              message
                .content
                .length >
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
            (
              previous
            ) => {
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
        } catch (
          err
        ) {
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
        canCreateTasks,
      ]
    );


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
    canSendMessages,
    canCreateTasks,

    members,
    departments,

    loadingDirectory,
    creatingGroup,

    createConversation,
    updateConversation,

    managingChannelId,
    archiveConversation,
    deleteConversation,

    convertingMessageId,
    convertedMessageIds,

    createTaskFromMessage,

    error,
  };
}