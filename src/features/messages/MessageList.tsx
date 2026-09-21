import {
  useEffect,
  useRef,
} from "react";

import type {
  StaffMessageWithAuthor,
} from "../../services/messagesService";

import {
  MessageBubble,
} from "./MessageBubble";


type Props = {
  messages:
    StaffMessageWithAuthor[];

  currentUserId:
    string;

  loading:
    boolean;

  canCreateTask:
    boolean;

  onCreateTask: (
    message:
      StaffMessageWithAuthor
  ) => void;
};


export function MessageList({
  messages,
  currentUserId,
  loading,
  canCreateTask,
  onCreateTask,
}: Props) {
  const bottomRef =
    useRef<
      HTMLDivElement | null
    >(null);


  useEffect(() => {
    bottomRef.current
      ?.scrollIntoView({
        behavior:
          "smooth",

        block:
          "end",
      });
  }, [
    messages,
  ]);


  if (
    loading
  ) {
    return (
      <div className="chat-body">
        <div className="empty-chat">
          Chargement des messages…
        </div>
      </div>
    );
  }


  if (
    messages.length ===
    0
  ) {
    return (
      <div className="chat-body">
        <div className="empty-chat">
          Aucun message dans ce salon.
        </div>
      </div>
    );
  }


  return (
    <div className="chat-body">
      {messages.map(
        (
          message
        ) => (
          <MessageBubble
            key={
              message.id
            }

            message={
              message
            }

            isMine={
              message.user_id ===
              currentUserId
            }

            canCreateTask={
              canCreateTask
            }

            onCreateTask={
              onCreateTask
            }
          />
        )
      )}

      <div
        ref={
          bottomRef
        }
      />
    </div>
  );
}