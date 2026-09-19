import { useState } from "react";

import { ChannelList } from "./ChannelList";
import { ChatHeader } from "./ChatHeader";
import { CreateChannelModal } from "./CreateChannelModal";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { useMessages } from "./useMessages";

export function MessagesBoard() {
  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [
    mobileChatOpen,
    setMobileChatOpen,
  ] = useState(false);

  const {
    user,

    channels,
    activeChannel,
    activeChannelId,
    setActiveChannelId,

    messages,

    loadingChannels,
    loadingMessages,

    sending,
    error,

    canManageChannels,

    members,
    departments,

    loadingDirectory,
    creatingGroup,

    createGroup,

    sendMessage,
    createTaskFromMessage,
  } = useMessages();

  function handleSelectChannel(
    channelId: string
  ) {
    setActiveChannelId(
      channelId
    );

    /*
     * Sur mobile :
     * ouvre le chat.
     *
     * Sur desktop :
     * le CSS garde les deux
     * colonnes visibles.
     */
    setMobileChatOpen(true);
  }

  function handleMobileBack() {
    setMobileChatOpen(false);
  }

  return (
    <div className="messages-page">
      {error && (
        <div className="messages-error">
          {error}
        </div>
      )}

      <div
        className={
          mobileChatOpen
            ? "messaging mobile-chat-open"
            : "messaging mobile-channel-list"
        }
      >
        <div className="messages-channels-panel">
          <ChannelList
            channels={
              channels
            }
            activeChannelId={
              activeChannelId
            }
            loading={
              loadingChannels
            }
            canManageChannels={
              canManageChannels
            }
            onSelect={
              handleSelectChannel
            }
            onCreateGroup={() =>
              setCreateModalOpen(
                true
              )
            }
          />
        </div>

        <section className="chat messages-chat-panel">
          <ChatHeader
            channel={
              activeChannel
            }
            onMobileBack={
              handleMobileBack
            }
          />

          <MessageList
            messages={
              messages
            }
            currentUserId={
              user.id
            }
            loading={
              loadingMessages
            }
            onCreateTask={
              createTaskFromMessage
            }
          />

          <MessageComposer
            disabled={
              !activeChannelId
            }
            sending={
              sending
            }
            onSend={
              sendMessage
            }
          />
        </section>
      </div>

      {canManageChannels && (
        <CreateChannelModal
          open={
            createModalOpen
          }
          members={
            members
          }
          departments={
            departments
          }
          creating={
            creatingGroup ||
            loadingDirectory
          }
          onClose={() =>
            setCreateModalOpen(
              false
            )
          }
          onCreate={
            createGroup
          }
        />
      )}
    </div>
  );
}