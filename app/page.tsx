import React from 'react';
import { PhotoUploader } from '../components/PhotoUploader';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 w-full max-w-5xl font-mono text-sm">
        <h1 className="mb-4 text-4xl font-bold">Selamat Datang di Proyek Anda</h1>
        <p className="mb-8">Ini adalah halaman utama website Anda yang menggunakan Next.js App Router.</p>

        <section className="rounded-xl border p-6">
          <h2 className="mb-2 text-2xl font-semibold">Features</h2>
          <p className="mb-4 text-sm text-gray-600">
            Fitur upload foto menggunakan integrasi UploadThing.
          </p>
          <PhotoUploader endpoint="imageUploader" />
        </section>
      </div>
    </main>
  );
}
