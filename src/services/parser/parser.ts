import { parseSync } from "subtitle";
import { SubtitleBlock } from "@/types/subtitle";

export function parseSubtitle(content: string): SubtitleBlock[] {
  const nodes = parseSync(content);

  return nodes
    .filter((node) => node.type === "cue")
    .map((node) => ({
      startTimeMs: node.data.start,
      endTimeMs: node.data.end,
      text: node.data.text,
    }));
}