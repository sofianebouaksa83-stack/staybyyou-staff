import {
  Hash,
  Plus,
} from "lucide-react";

import type {
  StaffChannel,
} from "../../services/messagesService";


type Props = {
  channels:
    StaffChannel[];

  activeChannelId:
    string | null;

  loading:
    boolean;

  canManageChannels:
    boolean;

  onSelect: (
    channelId:
      string
  ) => void;

  onCreateGroup:
    () => void;
};


export function ChannelList({
  channels,
  activeChannelId,
  loading,
  canManageChannels,
  onSelect,
  onCreateGroup,
}: Props) {
  const standardChannels =
    channels.filter(
      (
        channel
      ) =>
        channel.channel_type !==
        "group"
    );

  const groupChannels =
    channels.filter(
      (
        channel
      ) =>
        channel.channel_type ===
        "group"
    );


  return (
    <aside className="channels">
      <div className="channels-header">
        <strong>
          Conversations
        </strong>

        {canManageChannels && (
          <button
            type="button"
            className="channels-create-button"

            onClick={
              onCreateGroup
            }

            aria-label="Créer un conversation"
            title="Créer un conversation"
          >
            <Plus
              size={18}
            />
          </button>
        )}
      </div>


      <div className="channels-scroll">
        {loading ? (
          <div className="channels-empty">
            Chargement…
          </div>
        ) : channels.length ===
          0 ? (
          <div className="channels-empty">
            Aucune conversation
          </div>
        ) : (
          <>
            {standardChannels.length >
              0 && (
              <div className="channels-section">
                <div className="channels-section-title">
                  Équipe
                </div>

                <div className="channels-list">
                  {standardChannels.map(
                    (
                      channel
                    ) => (
                      <ChannelButton
                        key={
                          channel.id
                        }

                        channel={
                          channel
                        }

                        active={
                          activeChannelId ===
                          channel.id
                        }

                        onSelect={
                          onSelect
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}


            {groupChannels.length >
              0 && (
              <div className="channels-section">
                <div className="channels-section-title">
                  Groupes
                </div>

                <div className="channels-list">
                  {groupChannels.map(
                    (
                      channel
                    ) => (
                      <ChannelButton
                        key={
                          channel.id
                        }

                        channel={
                          channel
                        }

                        active={
                          activeChannelId ===
                          channel.id
                        }

                        onSelect={
                          onSelect
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}


function ChannelButton({
  channel,
  active,
  onSelect,
}: {
  channel:
    StaffChannel;

  active:
    boolean;

  onSelect: (
    channelId:
      string
  ) => void;
}) {
  return (
    <button
      type="button"

      className={
        active
          ? "channel-button active"
          : "channel-button"
      }

      onClick={() =>
        onSelect(
          channel.id
        )
      }
    >
      <span className="channel-button-icon">
        <Hash
          size={13}
        />
      </span>

      <span className="channel-button-content">
        <strong>
          {channel.name}
        </strong>

        {channel.description && (
          <small>
            {
              channel.description
            }
          </small>
        )}
      </span>
    </button>
  );
}