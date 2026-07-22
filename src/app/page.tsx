import UploadDropzone from "@/components/upload/UploadDropzone";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          LectureLens
        </h1>

        <UploadDropzone />
      </div>
    </main>
  );
}