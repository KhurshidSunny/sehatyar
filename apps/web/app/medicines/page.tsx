import BackHomeLink from "@/components/BackHomeLink";
import Disclaimer from "@/components/Disclaimer";

export default function MedicinesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3">
          <BackHomeLink />
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            دا درمل څه دی؟
          </h1>
          <span className="w-16" aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 px-4 py-6 sm:px-6">
        <p className="text-center text-lg text-muted sm:text-xl">
          د درملو پیک عکس واخلئ یا نوم ولیکئ
        </p>
      </main>

      <Disclaimer />
    </div>
  );
}
