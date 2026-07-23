"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { embedChunks } from "@/services/embeddings/embedChunks";
import { extractZip } from "@/services/upload/unzip";
import { parseSubtitle } from "@/services/parser/parser";
import { createChunks } from "@/services/chunking/chunker";

export default function UploadDropzone() {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (!file.name.toLowerCase().endsWith(".zip")) {
      alert("Please upload a ZIP file.");
      return;
    }

    try {
      const subtitleFiles = await extractZip(file);

      console.log("Subtitle Files:");

      for (const subtitleFile of subtitleFiles) {
        console.log("======================");
        console.log(subtitleFile.name);

        const parsed = parseSubtitle(subtitleFile.content);
        const chunks = createChunks(parsed);

        console.log("Subtitle Blocks:", parsed);
        console.log("Chunks:", chunks);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted transition"
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>Drop your ZIP file here...</p>
      ) : (
        <p>Drag & drop a ZIP file here, or click to browse.</p>
      )}
    </div>
  );
}