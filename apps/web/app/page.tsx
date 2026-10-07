export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-xl text-center">
          <p className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
            صحت یار
          </p>
          <p className="mt-1 text-lg font-medium text-foreground sm:text-xl">
            SehatYar
          </p>
          <p className="mt-3 text-base text-muted sm:text-lg">
            روغتیا پوښتنې او د درملو پېژندنه — په ساده پښتو کې
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">
          څه غواړئ وکړئ؟
        </p>

        <button
          type="button"
          disabled
          className="min-h-20 w-full rounded-2xl bg-brand px-6 py-5 text-xl font-semibold text-white shadow-sm sm:text-2xl"
        >
          روغتیا پوښتنې
          <span className="mt-1 block text-base font-normal text-teal-50 sm:text-lg">
            Health questions (soon)
          </span>
        </button>

        <button
          type="button"
          disabled
          className="min-h-20 w-full rounded-2xl border-2 border-brand bg-surface px-6 py-5 text-xl font-semibold text-brand shadow-sm sm:text-2xl"
        >
          دا درمل څه دی؟
          <span className="mt-1 block text-base font-normal text-muted sm:text-lg">
            What is this medicine? (soon)
          </span>
        </button>
      </main>

      <aside
        className="border-t-2 border-disclaimer-border bg-disclaimer-bg px-4 py-4 sm:px-6"
        role="note"
        aria-label="Safety disclaimer"
      >
        <p className="mx-auto max-w-xl text-center text-base font-medium leading-relaxed text-disclaimer-text sm:text-lg">
          دا اپلیکیشن یوازې معلومات ورکوي. دا ډاکټر نه دی او درمل نه تجویز کوي.
          که ناروغي سخته وي، کلینیک یا روغتون ته لاړ شئ.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-disclaimer-text/90">
          Information only — not a diagnosis or prescription. Seek clinic care for
          serious symptoms.
        </p>
      </aside>
    </div>
  );
}
