import { Inbox } from "lucide-react";

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <Inbox size={22} />
      <p>{text}</p>
    </div>
  );
}
