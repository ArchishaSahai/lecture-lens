import { Bot, Clock3, FileText, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface ChatSource {
  endTimeMs: number;
  lectureName: string;
  startTimeMs: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  sources?: ChatSource[];
  streaming?: boolean;
}

function formatTimestamp(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function preview(text: string) {
  const trimmedText = text.trim();
  return trimmedText.length > 140 ? `${trimmedText.slice(0, 140)}...` : trimmedText;
}

function cleanLectureName(lectureName: string) {
  const pathParts = lectureName.replace(/\\/g, "/").split("/");
  const fileName = (pathParts.at(-1) ?? lectureName)
    .replace(/\.(srt|vtt)$/i, "")
    .replace(/^\d+[\s_.-]*/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const moduleMatch = lectureName.match(/module[\s_-]*(\d+)/i);

  return moduleMatch ? `Module ${moduleMatch[1]}` : fileName || "Lecture source";
}

function deduplicateSources(sources: ChatSource[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = [
      cleanLectureName(source.lectureName).toLowerCase(),
      source.startTimeMs,
      source.endTimeMs,
      source.text.replace(/\s+/g, " ").trim().toLowerCase(),
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const sources = message.sources ? deduplicateSources(message.sources) : [];

  return (
    <article className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-black">
          <Bot className="size-4" />
        </span>
      )}
      <div
        className={`max-w-[85%] text-[15px] leading-7 sm:max-w-[75%] ${
          isUser
            ? "whitespace-pre-wrap rounded-3xl bg-zinc-800 px-4 py-2.5 text-zinc-100"
            : "py-0.5 text-zinc-200 [&_a]:text-blue-400 [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-600 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-zinc-900 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-zinc-700 [&_td]:p-2 [&_th]:border [&_th]:border-zinc-700 [&_th]:bg-zinc-900 [&_th]:p-2 [&_ul]:my-3 [&_ul]:list-disc"
        }`}
      >
        {isUser ? message.content : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        )}
        {message.streaming && <span className="ml-1 inline-block size-1.5 animate-pulse rounded-full bg-zinc-400" />}
        {!isUser && sources.length > 0 && (
          <section className="mt-5 border-t border-zinc-800 pt-4">
            <h3 className="text-xs font-medium text-zinc-400">Sources</h3>
            <div className="mt-3 space-y-3">
              {sources.map((source, index) => (
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm leading-5 text-zinc-500" key={`${source.lectureName}-${source.startTimeMs}-${index}`}>
                  <p className="flex items-center gap-2 text-zinc-300">
                    <FileText className="size-3.5 text-zinc-500" />
                    {cleanLectureName(source.lectureName)}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-zinc-600">
                    <Clock3 className="size-3.5" />
                    {formatTimestamp(source.startTimeMs)} - {formatTimestamp(source.endTimeMs)}
                  </p>
                  <p className="mt-2 text-zinc-500">&ldquo;{preview(source.text)}&rdquo;</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      {isUser && (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-zinc-800 text-zinc-300">
          <UserRound className="size-4" />
        </span>
      )}
    </article>
  );
}
