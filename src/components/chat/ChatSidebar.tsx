import {
  ChevronLeft,
  FileText,
  Folder,
  PanelLeftClose,
  Plus,
  UserRound,
} from "lucide-react";

import { ConversationList, ConversationSummary } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SidebarLecture {
  chunkCount: number;
  displayName: string;
  name: string;
  status: "Uploaded successfully";
  title: string;
}

interface ChatSidebarProps {
  activeConversationId: string | null;
  collapsed: boolean;
  conversations: ConversationSummary[];
  lectures: SidebarLecture[];
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  onToggle: () => void;
}

export function ChatSidebar({ activeConversationId, collapsed, conversations, lectures, onNewChat, onSelectConversation, onToggle }: ChatSidebarProps) {
  if (collapsed) {
    return (
      <aside className="hidden w-14 shrink-0 border-r border-zinc-900 bg-black py-3 md:flex md:flex-col md:items-center">
        <Button
          aria-label="Expand sidebar"
          className="text-zinc-400 hover:bg-zinc-900 hover:text-white"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <ChevronLeft className="size-5 rotate-180" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="hidden h-dvh w-[260px] shrink-0 flex-col border-r border-zinc-900 bg-black md:flex">
      <div className="flex items-center gap-2 px-3 py-3">
        <Button
          className="h-10 flex-1 justify-start rounded-lg border-zinc-800 bg-zinc-950 px-3 text-zinc-100 hover:bg-zinc-900"
          onClick={onNewChat}
          type="button"
          variant="outline"
        >
          <Plus className="size-4" />
          New chat
        </Button>
        <Button
          aria-label="Collapse sidebar"
          className="text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
          onClick={onToggle}
          size="icon"
          type="button"
          variant="ghost"
        >
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 pb-4">
        <ConversationList activeConversationId={activeConversationId} conversations={conversations} onSelect={onSelectConversation} />
        <div className="mx-3 my-5 border-t border-zinc-900" />
        <div className="space-y-1 px-4">
          <p className="pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Library
          </p>
          <div className="flex items-center gap-2 py-1.5 text-sm text-zinc-400">
            <Folder className="size-4 text-zinc-500" />
            Uploaded lectures
          </div>
          {lectures.length === 0 ? (
            <div className="ml-6 flex items-center gap-2 py-1.5 text-sm text-zinc-500">
              <FileText className="size-3.5" />
              No documents yet
            </div>
          ) : lectures.map((lecture) => (
            <div className="ml-6 flex items-start gap-2 py-1.5 text-sm text-zinc-500" key={lecture.name}>
              <FileText className="mt-0.5 size-3.5 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate text-zinc-400">{lecture.displayName}</span>
                <span className="block text-xs text-zinc-600">
                  {lecture.title} · {lecture.chunkCount} chunks
                </span>
              </span>
            </div>
          ))}
          {lectures.length > 0 && (
            <p className="ml-6 pt-1 text-xs text-zinc-600">
              {lectures.length} {lectures.length === 1 ? "lecture" : "lectures"} uploaded
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-zinc-900 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-zinc-900" type="button">
          <span className="grid size-8 place-items-center rounded-full bg-zinc-800 text-zinc-300">
            <UserRound className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-zinc-200">Your account</span>
            <span className="block truncate text-xs text-zinc-500">Free plan</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
