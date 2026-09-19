import {
  ArrowLeft,
  Hash,
} from "lucide-react";

import type {
  StaffChannel,
} from "../../services/messagesService";

type Props = {
  channel:
    StaffChannel | null;

  onMobileBack?: () => void;
};

export function ChatHeader({
  channel,
  onMobileBack,
}: Props) {
  return (
    <header className="chat-head">
      <div className="chat-head-left">
        <button
          type="button"
          className="chat-mobile-back"
          onClick={
            onMobileBack
          }
          aria-label="Retour aux conversations"
        >
          <ArrowLeft
            size={18}
          />
        </button>

        <div className="chat-channel-icon">
          <Hash size={15} />
        </div>

        <div className="chat-head-content">
          <strong>
            {channel
              ? channel.name
              : "Messages"}
          </strong>

          <small>
            {channel?.description ||
              "Communication d’équipe"}
          </small>
        </div>
      </div>
    </header>
  );
}