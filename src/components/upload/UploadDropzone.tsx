"use client";

import { ReactNode, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { extractZip } from "@/services/upload/unzip";
import { parseSubtitle } from "@/services/parser/parser";
import { createChunks } from "@/services/chunking/chunker";

export interface UploadedLecture {
  chunkCount: number;
  name: string;
  status: "Uploaded successfully";
}

interface UploadDropzoneProps {
  children?: ReactNode;
  onUploadComplete?: (lectures: UploadedLecture[]) => void;
}

export default function UploadDropzone({ children, onUploadComplete }: UploadDropzoneProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (!file.name.toLowerCase().endsWith(".zip")) {
      alert("Please upload a ZIP file.");
      return;
    }

    try {
      const subtitleFiles = await extractZip(file);
      const lectures = subtitleFiles.map((subtitleFile) => ({
        lectureName: subtitleFile.name,
        chunks: createChunks(parseSubtitle(subtitleFile.content)),
      }));

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectures }),
      });

      if (!response.ok) {
        throw new Error("Unable to store transcript embeddings.");
      }

      const result: unknown = await response.json();
      const uploadedLectures = result && typeof result === "object"
        ? (result as Record<string, unknown>).lectures
        : undefined;

      if (
        !Array.isArray(uploadedLectures) ||
        !uploadedLectures.every(
          (lecture) =>
            lecture &&
            typeof lecture === "object" &&
            typeof (lecture as Record<string, unknown>).lectureName === "string" &&
            typeof (lecture as Record<string, unknown>).chunkCount === "number"
        )
      ) {
        throw new Error("Upload completed with an invalid response.");
      }

      onUploadComplete?.(uploadedLectures.map((lecture) => ({
        name: (lecture as { lectureName: string }).lectureName,
        chunkCount: (lecture as { chunkCount: number }).chunkCount,
        status: "Uploaded successfully",
      })));
    } catch (error) {
      console.error(error);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={children ? undefined : "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted transition"}>
      <input {...getInputProps()} />

      {children ?? (isDragActive ? (
        <p>Drop your ZIP file here...</p>
      ) : (
        <p>Drag & drop a ZIP file here, or click to browse.</p>
      ))}
    </div>
  );
}
