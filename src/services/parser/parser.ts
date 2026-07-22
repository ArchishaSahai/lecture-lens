import { parseSync } from "subtitle";

export function parseSubtitle(content: string) {
  const nodes = parseSync(content);

  return nodes
    .filter((node) => node.type === "cue")
    .map((node) => ({
      startTimeMs: node.data.start,
      endTimeMs: node.data.end,
      text: node.data.text,
    }));
}