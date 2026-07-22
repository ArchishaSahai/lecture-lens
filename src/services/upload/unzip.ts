import JSZip from "jszip";

export interface UploadedSubtitleFile {
  name: string;
  content: string;
}

export async function extractZip(
  file: File
): Promise<UploadedSubtitleFile[]> {
  const zip = await JSZip.loadAsync(file);

  const subtitleFiles = Object.values(zip.files).filter(
    (zipFile) =>
      !zipFile.dir &&
      !zipFile.name.startsWith("__MACOSX") &&
      !zipFile.name.includes("/._") &&
      (zipFile.name.endsWith(".srt") ||
        zipFile.name.endsWith(".vtt"))
  );

  const files: UploadedSubtitleFile[] = [];

  for (const zipFile of subtitleFiles) {
    const content = await zipFile.async("text");

    files.push({
      name: zipFile.name,
      content,
    });
  }

  return files;
}