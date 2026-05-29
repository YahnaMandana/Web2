import { PhotoUploader } from "../../components/PhotoUploader";

const jadwalBola = [
  "29 Mei 2026 · 01.45 WIB — Ireland vs Qatar",
  "29 Mei 2026 · 20.00 WIB — Indonesia vs Vietnam",
  "30 Mei 2026 · 02.30 WIB — Brazil vs Argentina",
];

export default function FiturPage() {
  return (
    <main className="flex min-h-screen justify-center p-8 sm:p-12">
      <section className="w-full max-w-3xl space-y-6">
        <div className="rounded-2xl border border-emerald-300/30 bg-black/80 p-6 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <h1 className="mb-4 text-center text-2xl font-bold tracking-wide text-emerald-300">
            ⚽ Info Jadwal Bola
          </h1>
          <ul className="space-y-2 text-sm text-emerald-100/90">
            {jadwalBola.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-emerald-300/20 bg-emerald-300/5 px-4 py-2 text-center"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto flex w-full max-w-xl justify-center rounded-2xl border border-emerald-300/25 bg-black/70 p-5">
          <PhotoUploader endpoint="imageUploader" />
        </div>
      </section>
    </main>
  );
}
