import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

const prompts = [
  "Summarize my uploaded lectures",
  "Create a study guide for this topic",
  "Explain a concept in simple terms",
  "Quiz me on the material",
];

interface EmptyStateProps {
  onPromptSelect: (prompt: string) => void;
  uploadStatus: string | null;
  uploadTrigger: ReactNode;
}

export function EmptyState({ onPromptSelect, uploadStatus, uploadTrigger }: EmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 pb-24 pt-10 text-center">
      <div className="mb-6 grid size-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100">
        <span className="text-lg font-semibold">L</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-[32px]">LectureLens</h1>
      <p className="mt-3 max-w-md text-[15px] leading-6 text-zinc-500">
        Ask questions, review concepts, and find answers across your uploaded knowledge.
      </p>
      {uploadTrigger}
      {uploadStatus && <p className="mt-2 text-xs text-zinc-500">{uploadStatus}</p>}
      <div className="mt-10 grid w-full max-w-2xl gap-2 text-left sm:grid-cols-2">
        {prompts.map((prompt) => (
          <button
            className="group flex min-h-16 items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
            key={prompt}
            onClick={() => onPromptSelect(prompt)}
            type="button"
          >
            <span>{prompt}</span>
            <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
