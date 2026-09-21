import {
  Send,
} from "lucide-react";

import {
  useState,
} from "react";

type Props = {
  disabled: boolean;

  canSend: boolean;

  sending: boolean;

  onSend: (
    content: string
  ) => Promise<void>;
};

export function MessageComposer({
  disabled,
  canSend,
  sending,
  onSend,
}: Props) {
  const [
    content,
    setContent,
  ] = useState("");

  async function handleSubmit() {
    const trimmed =
      content.trim();

    if (
      !trimmed ||
      disabled ||
      !canSend ||
      sending
    ) {
      return;
    }

    await onSend(
      trimmed
    );

    setContent("");
  }

  function handleKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSubmit();
    }
  }

  const inputDisabled =
    disabled ||
    !canSend ||
    sending;

  return (
    <div className="composer">
      <input
        type="text"
        value={content}
        onChange={(
          event
        ) =>
          setContent(
            event.target.value
          )
        }
        onKeyDown={
          handleKeyDown
        }
        placeholder={
          disabled
            ? "Sélectionnez un salon"
            : !canSend
              ? "Vous n’avez pas la permission d’envoyer des messages"
              : "Écrire un message…"
        }
        disabled={
          inputDisabled
        }
      />

      <button
        type="button"
        className="send-button"
        onClick={() =>
          void handleSubmit()
        }
        disabled={
          inputDisabled ||
          !content.trim()
        }
        aria-label="Envoyer le message"
        title="Envoyer"
      >
        <Send
          size={17}
        />
      </button>
    </div>
  );
}