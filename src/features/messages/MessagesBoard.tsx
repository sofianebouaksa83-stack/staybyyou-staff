import {
  useState,
} from "react";

import {
  ChannelList,
} from "./ChannelList";

import {
  ChatHeader,
} from "./ChatHeader";

import {
  CreateChannelModal,
} from "./CreateChannelModal";

import {
  EditChannelModal,
} from "./EditChannelModal";

import {
  MessageComposer,
} from "./MessageComposer";

import {
  MessageList,
} from "./MessageList";

import {
  useMessages,
} from "./useMessages";


export function MessagesBoard() {
  const [
    createModalOpen,
    setCreateModalOpen,
  ] = useState(false);

  const [
    editModalOpen,
    setEditModalOpen,
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

    sendMessage,
    createTaskFromMessage,
  } = useMessages();


  function handleSelectChannel(
    channelId:
      string
  ) {
    setActiveChannelId(
      channelId
    );

    setMobileChatOpen(
      true
    );
  }


  function handleMobileBack() {
    setMobileChatOpen(
      false
    );
  }


  const channelBusy =
    Boolean(
      activeChannel?.id &&
      managingChannelId ===
        activeChannel.id
    );


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

            canManageChannels={
              canManageChannels
            }

            busy={
              channelBusy
            }

            onMobileBack={
              handleMobileBack
            }

            onEdit={() =>
              setEditModalOpen(
                true
              )
            }

            onArchive={
              archiveConversation
            }

            onDelete={
              deleteConversation
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

            canCreateTask={
              canCreateTasks
            }

            onCreateTask={
              createTaskFromMessage
            }
          />


          <MessageComposer
            disabled={
              !activeChannelId
            }

            canSend={
              canSendMessages
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
        <>
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
              createConversation
            }
          />


          <EditChannelModal
            open={
              editModalOpen
            }

            channel={
              activeChannel
            }

            members={
              members
            }

            departments={
              departments
            }

            saving={
              channelBusy
            }

            onClose={() =>
              setEditModalOpen(
                false
              )
            }

            onSave={
              updateConversation
            }
          />
        </>
      )}
    </div>
  );
}