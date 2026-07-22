"use client";
import { parseSubtitle } from "@/services/parser/parser";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { extractZip } from "@/services/upload/unzip";

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

      subtitleFiles.forEach((file) => {
        console.log("======================");
        console.log(file.name);
        const parsed = parseSubtitle(file.content);

console.log(file.name);
console.log(parsed);
      });
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