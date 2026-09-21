import {
  Archive,
  ArrowLeft,
  Hash,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  StaffChannel,
} from "../../services/messagesService";


type Props = {
  channel:
    StaffChannel | null;

  canManageChannels:
    boolean;

  busy:
    boolean;

  onMobileBack?:
    () => void;

  onEdit:
    () => void;

  onArchive: (
    channelId:
      string
  ) => Promise<void>;

  onDelete: (
    channelId:
      string
  ) => Promise<void>;
};


export function ChatHeader({
  channel,
  canManageChannels,
  busy,
  onMobileBack,
  onEdit,
  onArchive,
  onDelete,
}: Props) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const menuRef =
    useRef<
      HTMLDivElement | null
    >(null);


  useEffect(() => {
    setMenuOpen(
      false
    );
  }, [
    channel?.id,
  ]);


  useEffect(() => {
    function handleOutsideClick(
      event:
        MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as
            Node
        )
      ) {
        setMenuOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  async function handleArchive() {
    if (
      !channel ||
      busy ||
      channel.is_system
    ) {
      return;
    }

    const label =
      channel.channel_type ===
      "group"
        ? "groupe"
        : "salon";

    const confirmed =
      window.confirm(
        `Archiver le ${label} "${channel.name}" ?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setMenuOpen(
      false
    );

    await onArchive(
      channel.id
    );
  }


  async function handleDelete() {
    if (
      !channel ||
      busy ||
      channel.is_system
    ) {
      return;
    }

    const label =
      channel.channel_type ===
      "group"
        ? "groupe"
        : "salon";

    const confirmed =
      window.confirm(
        `Supprimer définitivement le ${label} "${channel.name}" ?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setMenuOpen(
      false
    );

    await onDelete(
      channel.id
    );
  }


  function handleEdit() {
    setMenuOpen(
      false
    );

    onEdit();
  }


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
          <Hash
            size={15}
          />
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


      {canManageChannels &&
        channel && (
          <div
            className="chat-channel-actions"

            ref={
              menuRef
            }
          >
            <button
              type="button"
              className="chat-channel-menu-button"

              onClick={() =>
                setMenuOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }

              disabled={
                busy
              }

              aria-label="Actions du salon"
              title="Actions du salon"
            >
              <MoreHorizontal
                size={18}
              />
            </button>


            {menuOpen && (
              <div className="chat-channel-menu">
                <button
                  type="button"

                  onClick={
                    handleEdit
                  }
                >
                  <Pencil
                    size={15}
                  />

                  Modifier
                </button>


                {!channel.is_system && (
                  <>
                    <button
                      type="button"

                      onClick={() =>
                        void handleArchive()
                      }
                    >
                      <Archive
                        size={15}
                      />

                      Archiver
                    </button>


                    <button
                      type="button"
                      className="danger"

                      onClick={() =>
                        void handleDelete()
                      }
                    >
                      <Trash2
                        size={15}
                      />

                      Supprimer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
    </header>
  );
}