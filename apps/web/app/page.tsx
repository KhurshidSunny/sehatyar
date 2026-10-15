import Link from "next/link";

import Disclaimer from "@/components/Disclaimer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-xl text-center">
          <p
            className="notranslate text-3xl font-bold tracking-tight text-brand sm:text-4xl"
            translate="no"
            lang="ps"
          >
            صحت یار
          </p>
          <p
            className="notranslate mt-1 text-lg font-medium text-foreground sm:text-xl"
            translate="no"
            lang="en"
          >
            SehatYar
          </p>
          <p className="mt-3 text-base text-muted sm:text-lg">
            روغتیا پوښتنې او د درملو پېژندنه — په ساده پښتو کې
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">څه غواړئ وکړئ؟</p>

        <Link
          href="/faqs"
          className="flex min-h-20 w-full flex-col items-center justify-center rounded-2xl bg-brand px-6 py-5 text-center text-xl font-semibold text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
        >
          روغتیا پوښتنې
          <span className="mt-1 block text-base font-normal text-teal-50 sm:text-lg">
            Health questions
          </span>
        </Link>

        <Link
          href="/medicines"
          className="flex min-h-20 w-full flex-col items-center justify-center rounded-2xl border-2 border-brand bg-surface px-6 py-5 text-center text-xl font-semibold text-brand shadow-sm transition hover:bg-brand/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:text-2xl"
        >
          دا درمل څه دی؟
          <span className="mt-1 block text-base font-normal text-muted sm:text-lg">
            What is this medicine?
          </span>
        </Link>
      </main>

      <Disclaimer />
    </div>
  );
}
