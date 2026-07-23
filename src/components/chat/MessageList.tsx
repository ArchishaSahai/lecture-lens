import { ChatMessage, MessageBubble } from "@/components/chat/MessageBubble";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-8 px-4 py-8 sm:px-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
