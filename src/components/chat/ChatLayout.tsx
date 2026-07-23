"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Paperclip, Upload } from "lucide-react";

import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationSummary } from "@/components/chat/ConversationList";
import { ChatSidebar, SidebarLecture } from "@/components/chat/ChatSidebar";
import { EmptyState } from "@/components/chat/EmptyState";
import { ChatMessage, ChatSource } from "@/components/chat/MessageBubble";
import { MessageList } from "@/components/chat/MessageList";
import UploadDropzone, { UploadedLecture } from "@/components/upload/UploadDropzone";
import { Button } from "@/components/ui/button";

interface Conversation extends ConversationSummary {
  messages: ChatMessage[];
}

function createId() {
  return crypto.randomUUID();
}

function isChatSource(value: unknown): value is ChatSource {
  if (!value || typeof value !== "object") return false;

  const source = value as Record<string, unknown>;
  return (
    typeof source.lectureName === "string" &&
    typeof source.startTimeMs === "number" &&
    typeof source.endTimeMs === "number" &&
    typeof source.text === "string"
  );
}

function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function createSidebarLecture(lecture: UploadedLecture): SidebarLecture {
  const pathParts = lecture.name.replace(/\\/g, "/").split("/");
  const fileName = (pathParts.at(-1) ?? lecture.name).replace(/\.(srt|vtt)$/i, "");
  const moduleMatch = lecture.name.match(/module[\s_-]*(\d+)/i);
  const title = toTitleCase(fileName.replace(/^\d+[\s_.-]*/i, "")) || "Untitled lecture";

  return {
    ...lecture,
    displayName: moduleMatch ? `Module ${moduleMatch[1]}` : title,
    title: moduleMatch ? title : lecture.status,
  };
}

function lectureIdentity(lecture: SidebarLecture) {
  const moduleMatch = lecture.displayName.match(/^Module\s+(\d+)$/i);
  if (moduleMatch) return `module-${Number(moduleMatch[1])}`;

  return lecture.name
    .replace(/\\/g, "/")
    .split("/")
    .at(-1)!
    .replace(/\.(srt|vtt)$/i, "")
    .toLowerCase()
    .replace(/[_\s-]+/g, " ")
    .trim();
}

function mergeSidebarLectures(lectures: SidebarLecture[]): SidebarLecture[] {
  const grouped = new Map<string, SidebarLecture>();

  lectures.forEach((lecture) => {
    const key = lectureIdentity(lecture);
    const existing = grouped.get(key);
    grouped.set(key, existing
      ? { ...existing, chunkCount: existing.chunkCount + lecture.chunkCount }
      : lecture);
  });

  return [...grouped.values()].sort((left, right) =>
    left.displayName.localeCompare(right.displayName, undefined, { numeric: true })
  );
}

export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lectures, setLectures] = useState<SidebarLecture[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages]);

  function startNewChat() {
    setActiveConversationId(null);
    setDraft("");
  }

  const uploadStatus = lectures.length === 0
    ? null
    : lectures.length === 1
      ? "Uploaded successfully"
      : `${lectures.length} lectures uploaded`;

  function handleUploadComplete(uploadedLectures: UploadedLecture[]) {
    setLectures((currentLectures) => mergeSidebarLectures([
      ...currentLectures,
      ...uploadedLectures.map(createSidebarLecture),
    ]));
  }

  async function sendMessage() {
    const question = draft.trim();
    if (!question || isLoading) return;

    const conversationId = activeConversationId ?? createId();
    const assistantMessageId = createId();
    const userMessage: ChatMessage = { id: createId(), role: "user", content: question };
    const loadingMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setConversations((currentConversations) => {
      const existingConversation = currentConversations.find(
        (conversation) => conversation.id === conversationId
      );

      if (!existingConversation) {
        return [
          ...currentConversations,
          { id: conversationId, title: question, messages: [userMessage, loadingMessage] },
        ];
      }

      return currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, userMessage, loadingMessage] }
          : conversation
      );
    });

    setActiveConversationId(conversationId);
    setDraft("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data: unknown = await response.json();

      if (
        !response.ok ||
        !data ||
        typeof data !== "object" ||
        typeof (data as { answer?: unknown }).answer !== "string"
      ) {
        throw new Error("Unable to answer the question.");
      }

      const answer = (data as { answer: string }).answer;
      const sources = Array.isArray((data as { sources?: unknown }).sources)
        ? (data as { sources: unknown[] }).sources.filter(isChatSource)
        : [];
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: answer, sources, streaming: false }
                    : message
                ),
              }
            : conversation
        )
      );
    } catch {
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === assistantMessageId
                    ? {
                        ...message,
                        content: "I couldn't complete that request. Please try again.",
                        streaming: false,
                      }
                    : message
                ),
              }
            : conversation
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  const uploadIconButton = (
    <Button
      aria-label="Upload a document"
      className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      size="icon-sm"
      type="button"
      variant="ghost"
    >
      <Paperclip className="size-4" />
    </Button>
  );

  const uploadPrimaryButton = (
    <Button className="mt-6 rounded-lg bg-zinc-100 text-black hover:bg-white" type="button">
      <Upload className="size-4" />
      {uploadStatus ?? "Upload knowledge"}
    </Button>
  );

  return (
    <main className="flex h-dvh overflow-hidden bg-black text-zinc-100">
      <ChatSidebar
        activeConversationId={activeConversationId}
        collapsed={sidebarCollapsed}
        conversations={conversations}
        lectures={lectures}
        onNewChat={startNewChat}
        onSelectConversation={setActiveConversationId}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <section className="flex min-w-0 flex-1 flex-col bg-black">
        <header className="flex h-14 shrink-0 items-center border-b border-zinc-900 px-3 md:border-none md:px-5">
          <Button
            aria-label="Open sidebar"
            className="mr-2 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 md:hidden"
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Menu className="size-5" />
          </Button>
          <span className="text-sm font-medium text-zinc-200">LectureLens</span>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {activeConversation ? (
            <div className="mx-auto w-full max-w-3xl">
              <MessageList messages={activeConversation.messages} />
            </div>
          ) : (
            <EmptyState
              onPromptSelect={setDraft}
              uploadStatus={uploadStatus}
              uploadTrigger={
                <UploadDropzone onUploadComplete={handleUploadComplete}>
                  {uploadPrimaryButton}
                </UploadDropzone>
              }
            />
          )}
        </div>
        <ChatInput
          disabled={isLoading}
          onChange={setDraft}
          onSubmit={sendMessage}
          uploadTrigger={
            <UploadDropzone onUploadComplete={handleUploadComplete}>
              {uploadIconButton}
            </UploadDropzone>
          }
          value={draft}
        />
      </section>
    </main>
  );
}
