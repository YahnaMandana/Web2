"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { ComponentProps } from "react";

type PhotoUploaderProps = {
  endpoint: ComponentProps<typeof UploadButton>["endpoint"];
};

export function PhotoUploader({ endpoint }: PhotoUploaderProps) {
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="flex max-w-md flex-col gap-3 rounded-lg border p-4">
      <p className="text-sm font-medium">Pilih file gambar lalu unggah</p>
      <UploadButton
        endpoint={endpoint}
        aria-label="Unggah foto"
        content={{
          allowedContent: "Hanya gambar",
          button({ ready }) {
            return ready ? "Unggah Foto" : "Menyiapkan...";
          },
        }}
        onClientUploadComplete={(result) => {
          setErrorMessage("");
          const publicUrl = result?.[0]?.url ?? result?.[0]?.ufsUrl ?? "";
          if (!publicUrl) {
            setErrorMessage("Upload berhasil, tetapi URL publik tidak ditemukan.");
            return;
          }
          setUploadedUrl(publicUrl);
        }}
        onUploadError={(error) => {
          setUploadedUrl("");
          setErrorMessage(error.message || "Upload gagal.");
        }}
      />

      {uploadedUrl && (
        <p className="text-sm">
          URL publik:{" "}
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {uploadedUrl}
          </a>
        </p>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
