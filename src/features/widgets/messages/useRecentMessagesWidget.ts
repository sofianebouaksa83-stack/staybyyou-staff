import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useApp,
} from "../../../app/AppContext";
import {
  getChannels,
  getMessages,
  subscribeToMessages,
  type StaffMessageWithAuthor,
} from "../../../services/messagesService";

export type RecentWidgetMessage =
  StaffMessageWithAuthor & {
    channel_name: string;
  };

export function useRecentMessagesWidget() {
  const {
    hotelId,
  } = useApp();

  const [
    messages,
    setMessages,
  ] = useState<
    RecentWidgetMessage[]
  >([]);

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
    let active = true;
    let unsubscribers:
      Array<() => void> = [];

    async function load() {
      if (!hotelId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const channels =
          await getChannels(
            hotelId
          );

        const selected =
          channels.slice(0, 8);

        const results =
          await Promise.all(
            selected.map(
              async (
                channel
              ) => {
                const rows =
                  await getMessages(
                    hotelId,
                    channel.id
                  );

                return rows.map(
                  (message) => ({
                    ...message,
                    channel_name:
                      channel.name,
                  })
                );
              }
            )
          );

        if (!active) {
          return;
        }

        setMessages(
          results
            .flat()
            .sort(
              (a, b) =>
                new Date(
                  b.created_at
                ).getTime() -
                new Date(
                  a.created_at
                ).getTime()
            )
            .slice(0, 8)
        );

        unsubscribers =
          selected.map(
            (channel) =>
              subscribeToMessages(
                channel.id,
                () => {
                  void load();
                }
              )
          );
      } catch (loadError) {
        console.error(
          "Erreur messages widget :",
          loadError
        );

        if (active) {
          setError(
            "Impossible de charger les messages."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
      unsubscribers.forEach(
        (unsubscribe) =>
          unsubscribe()
      );
    };
  }, [hotelId]);

  const unreadLikeCount =
    useMemo(
      () => messages.length,
      [messages]
    );

  return {
    messages,
    count:
      unreadLikeCount,
    loading,
    error,
  };
}
