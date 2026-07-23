import { ArrowUp } from "lucide-react";
import { FormEvent, KeyboardEvent, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  uploadTrigger: ReactNode;
  value: string;
}

export function ChatInput({ disabled = false, onChange, onSubmit, uploadTrigger, value }: ChatInputProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="border-t border-zinc-900 bg-black px-3 pb-4 pt-3 sm:px-6 sm:pb-6">
      <form className="mx-auto max-w-3xl rounded-[26px] border border-zinc-700 bg-zinc-950 p-2 shadow-2xl shadow-black/30" onSubmit={handleSubmit}>
        <Textarea
          aria-label="Message"
          className="min-h-12 max-h-40 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
          placeholder="Ask anything about your uploaded knowledge..."
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center justify-between px-1 pb-0.5">
          {uploadTrigger}
          <Button
            aria-label="Send message"
            className="rounded-full bg-zinc-100 text-black hover:bg-white"
            size="icon-sm"
            disabled={disabled || value.trim().length === 0}
            type="submit"
          >
            <ArrowUp className="size-4" />
          </Button>
        </div>
      </form>
      <p className="mt-2 text-center text-[11px] text-zinc-600">
        LectureLens can make mistakes. Check important information.
      </p>
    </div>
  );
}
