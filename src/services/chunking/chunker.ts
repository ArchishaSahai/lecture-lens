import { SubtitleBlock } from "@/types/subtitle";
import { TranscriptChunk } from "@/types/chunk";

export function createChunks(
  subtitleBlocks: SubtitleBlock[],
  maxCharacters = 1000
): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];

  let currentText = "";
  let startTimeMs = 0;
  let endTimeMs = 0;

  for (const block of subtitleBlocks) {
    if (currentText.length === 0) {
      startTimeMs = block.startTimeMs;
    }

    if (currentText.length + block.text.length > maxCharacters) {
      chunks.push({
        startTimeMs,
        endTimeMs,
        text: currentText.trim(),
      });

      currentText = "";
      startTimeMs = block.startTimeMs;
    }

    currentText += " " + block.text;
    endTimeMs = block.endTimeMs;
  }

  if (currentText.length > 0) {
    chunks.push({
      startTimeMs,
      endTimeMs,
      text: currentText.trim(),
    });
  }

  return chunks;
}