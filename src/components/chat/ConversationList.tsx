import { MessageSquare, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ConversationSummary {
  id: string;
  title: string;
}

interface ConversationListProps {
  activeConversationId: string | null;
  conversations: ConversationSummary[];
  onSelect: (conversationId: string) => void;
}

export function ConversationList({ activeConversationId, conversations, onSelect }: ConversationListProps) {
  return (
    <div className="space-y-1 px-2">
      <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
        Recent
      </p>
      {conversations.length === 0 && (
        <p className="px-2 py-2 text-sm text-zinc-600">No conversations yet</p>
      )}
      {conversations.map((conversation) => (
        <button
          className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-900 ${
            activeConversationId === conversation.id ? "bg-zinc-900 text-zinc-100" : "text-zinc-400"
          }`}
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          type="button"
        >
          <MessageSquare className="size-4 shrink-0 text-zinc-500" />
          <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
          <Button
            aria-label={`More options for ${conversation.title}`}
            className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </button>
      ))}
    </div>
  );
}
